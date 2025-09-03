import { Injectable } from '@angular/core';

import { Store } from '@ngrx/store';

import { filter, map, Observable, of, OperatorFunction, pipe, switchMap, take, tap, UnaryFunction } from 'rxjs';

import { RuleService, SelectionState } from '@alfresco/adf-extensions';
import { AppStore, getAppSelection } from '@alfresco/aca-shared/store';

import { SpinnerOverlayService } from '@contezza/core/services';

import { ErrorHandler } from '@contezza/core/notifications';
import { RuleContextService } from '@contezza/core/context';
import { OptionalValueOf } from '@contezza/core/utils';

type EntryOf<T> = OptionalValueOf<T, 'entry'>;
type EntryOfOrArray<T> = T extends (infer TArrayItem)[] ? EntryOf<TArrayItem>[] : EntryOf<T>;

/**
 * Equals `T` if both `TRef` and `T` are array types or if both are not array type.
 * Equals `never` if either `TRef` or `T` is an array type but not both.
 */
type MatchArrayKind<TRef, T> = TRef extends readonly any[] ? (T extends readonly any[] ? T : never) : T extends readonly any[] ? never : T;

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

    getPayload<
        TKey extends keyof Pick<SelectionState, 'last' | 'nodes' | 'libraries'>,
        TPayloadKey extends string = 'payload',
        TAction extends { [K in TPayloadKey]?: MatchArrayKind<SelectionState[TKey], TAction[TPayloadKey]> } = { payload?: any }
    >(key: TKey, payloadKey: TPayloadKey = 'payload' as TPayloadKey): UnaryFunction<Observable<TAction>, Observable<EntryOfOrArray<NonNullable<TAction[TPayloadKey]>>>> {
        return pipe(
            switchMap(({ [payloadKey]: payload }) =>
                payload
                    ? of(payload)
                    : this.store.select(getAppSelection).pipe(
                          take(1),
                          map((_) => _[key])
                      )
            ),
            filter(Boolean),
            map((payload) => {
                const extractEntry = (x: any) => (typeof x === 'object' && 'entry' in x ? x.entry : x);
                return Array.isArray(payload) ? payload.map(extractEntry) : extractEntry(payload);
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
