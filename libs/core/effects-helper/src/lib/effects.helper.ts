import { Injectable } from '@angular/core';

import { Store } from '@ngrx/store';

import { filter, map, Observable, of, OperatorFunction, pipe, switchMap, take, tap, UnaryFunction } from 'rxjs';

import { RuleService, SelectionState } from '@alfresco/adf-extensions';
import { AppStore, getAppSelection } from '@alfresco/aca-shared/store';

import { SpinnerOverlayService } from '@contezza/core/services';

import { ErrorHandler } from '@contezza/core/notifications';
import { RuleContextService } from '@contezza/core/context';

type EntryOfOrArray<T> = T extends { entry: infer TInner } ? TInner : T extends { entry: infer TInner }[] ? TInner[] : never;

/**
 * Helper class defined to improve code reusability in Effects.
 */
@Injectable({ providedIn: 'root' })
export class EffectsHelper {
    constructor(
        private readonly store: Store<AppStore>,
        private readonly spinner: SpinnerOverlayService,
        private readonly errorHandler: ErrorHandler,
        private readonly ruleService: RuleService,
        private readonly ruleContext$: RuleContextService
    ) {}

    execute<TIn, TOut>(fn: (_: TIn) => Observable<TOut>): OperatorFunction<TIn, TOut> {
        return pipe(
            tap(() => this.spinner.show()),
            switchMap((nodes: TIn) =>
                fn(nodes).pipe(
                    this.errorHandler.catchError,
                    tap(() => this.spinner.hide()),
                    filter<TOut>(Boolean)
                )
            )
        );
    }

    getPayload<T extends keyof Pick<SelectionState, 'last' | 'nodes' | 'libraries'>>(
        key: T
    ): UnaryFunction<Observable<{ payload?: SelectionState[T] }>, Observable<EntryOfOrArray<SelectionState[T]>>> {
        return pipe(
            switchMap(({ payload }) =>
                payload
                    ? of(payload)
                    : this.store.select(getAppSelection).pipe(
                          take(1),
                          map((_) => _[key])
                      )
            ),
            filter(Boolean),
            map((payload) => {
                if (Array.isArray(payload)) {
                    return payload.map((_) => _.entry) as any;
                } else {
                    return payload.entry;
                }
            })
        );
    }

    /**
     * Filters effects based on the evaluation of a rule.
     *
     * @param rule The rule string to evaluate.
     */
    filterByRule<TAction>(rule: string): OperatorFunction<TAction, TAction> {
        return pipe(
            switchMap(() => this.ruleContext$.pipe(take(1))),
            filter((context: any) => this.ruleService.evaluateRule(rule, context))
        );
    }
}
