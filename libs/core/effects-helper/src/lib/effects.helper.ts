import { Injectable } from '@angular/core';

import { Store } from '@ngrx/store';

import { filter, map, Observable, of, OperatorFunction, pipe, switchMap, take, tap, UnaryFunction } from 'rxjs';

import { AppStore, getAppSelection, getCurrentFolder } from '@alfresco/aca-shared/store';
import { RuleService, SelectionState } from '@alfresco/adf-extensions';
import { Node, NodeEntry } from '@alfresco/js-api';

import { ActionTrigger, RuleContextService } from '@contezza/core/context';
import { ErrorHandler } from '@contezza/core/notifications';
import { SpinnerOverlayService } from '@contezza/core/services';
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
        private readonly ruleContext$: RuleContextService,
    ) {}

    execute<TIn, TOut>(fn: (_: TIn) => Observable<TOut>): OperatorFunction<TIn, TOut> {
        return pipe(
            tap(() => this.spinner.show()),
            switchMap((nodes: TIn) =>
                fn(nodes).pipe(
                    this.errorHandler.catchError,
                    tap(() => this.spinner.hide()),
                    filter<TOut>(Boolean),
                ),
            ),
        );
    }

    /**
     * Returns a pipeable operator which extracts the payload of the observed action, with the following rules:
     * - if the action already has a payload, then this is returned;
     * - else if the action is triggered from a floating button, then the current folder is returned;
     * - else the payload is extracted from the app selection, using the parameter `key`.
     *
     * If the payload is an `entry` type, then the inner entry is always extracted, e.g. {@link Node} from {@link NodeEntry}.
     *
     * The parameter `key` is also used to enforce type compatibility.
     * For instance, an action which expects an array as payload, cannot be piped into this operator with `key = last`.
     * The payload is by default identified by the key `payload`, this can be customised using the optional parameter `payloadKey`.
     *
     * @param key key used to extract the payload from the app selection and to enforce type compatibility
     * @param payloadKey key used to extract the payload from the action itself, defaults to `payload`
     * @returns a pipeable operator which extracts the payload of the observed action
     */
    getPayload<
        TKey extends keyof Pick<SelectionState, 'last' | 'nodes' | 'libraries'>,
        TPayloadKey extends string = 'payload',
        TAction extends { [K in TPayloadKey]?: MatchArrayKind<SelectionState[TKey], TAction[TPayloadKey]> } & { trigger?: ActionTrigger } = { payload?: any },
    >(key: TKey, payloadKey: TPayloadKey = 'payload' as TPayloadKey): UnaryFunction<Observable<TAction>, Observable<EntryOfOrArray<NonNullable<TAction[TPayloadKey]>>>> {
        return pipe(
            switchMap(({ [payloadKey]: payload, trigger }) => {
                if (payload) {
                    return of(payload);
                } else {
                    switch (trigger) {
                        case ActionTrigger.FLOATING_BUTTON:
                            return this.store.select(getCurrentFolder).pipe(
                                take(1),
                                map(node => (key === 'last' ? node : [node])),
                            );
                        default:
                            return this.store.select(getAppSelection).pipe(
                                take(1),
                                map(_ => _[key]),
                            );
                    }
                }
            }),
            filter(Boolean),
            map(payload => {
                const extractEntry = (x: any) => (typeof x === 'object' && 'entry' in x ? x.entry : x);
                return Array.isArray(payload) ? payload.map(extractEntry) : extractEntry(payload);
            }),
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
            filter((context: any) => this.ruleService.evaluateRule(rule, context)),
        );
    }
}
