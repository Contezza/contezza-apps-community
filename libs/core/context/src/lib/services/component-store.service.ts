import { Injectable } from '@angular/core';

import { Action, ActionsSubject, ReducerManager, StateObservable, Store } from '@ngrx/store';
import { FunctionIsNotAllowed } from '@ngrx/store/src/models';

import { Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';

import { getAppSelection, getCurrentFolder, getRuleContext, SetCurrentFolderAction, SetSelectedNodesAction } from '@alfresco/aca-shared/store';

import { RuleContextService } from './rule-context.service';

/**
 * Overrides `@ngrx/store` `dispatch` and `select` to integrate Alfresco's app state with component state.
 */
@Injectable()
export class ContezzaComponentStoreService extends Store {
    // TODO: add component type
    readonly components: any[] = [];

    constructor(state$: StateObservable, actionsObserver: ActionsSubject, reducerManager: ReducerManager, private readonly ruleContext$: RuleContextService) {
        super(state$, actionsObserver, reducerManager);
    }

    /**
     * Intercepts calls to `super.dispatch(action)`:
     * * synchronises app state with rule context, possibly including component state,
     * * calls protected method `doDispatch` allowing further overrides.
     *
     * @param action Action to be dispatched.
     */
    dispatch<ActionType extends Action = Action>(
        action: ActionType & FunctionIsNotAllowed<ActionType, 'Functions are not allowed to be dispatched. Did you forget to call the action creator function?'>
    ) {
        this.ruleContext$
            .pipe(
                take(1),
                tap(({ selection, navigation }) => {
                    super.dispatch(new SetSelectedNodesAction(selection.nodes));
                    super.dispatch(new SetCurrentFolderAction(navigation.currentFolder));
                })
            )
            .subscribe(() => this.doDispatch<ActionType>(action));
    }

    /**
     * Before calling `super.dispatch(action)` checks whether the `action`'s `type` matches the name of a function in one of the registered `components`, if so calls that function instead of `super.dispatch(action)`.
     *
     * @param action Action to be dispatched.
     * @protected
     */
    protected doDispatch<ActionType extends Action = Action>(
        action: ActionType & FunctionIsNotAllowed<ActionType, 'Functions are not allowed to be dispatched. Did you forget to call the action creator function?'>
    ) {
        const { components } = this;
        const { type } = action;
        const payload = 'payload' in action ? action['payload'] : undefined;
        const component = components.find((c) => !!c?.[type]);
        if (component) {
            component[type](payload);
        } else {
            super.dispatch<ActionType>(action);
        }
    }

    /**
     * Intercepts `select` calls, redirecting calls for `getRuleContext`, `getAppSelection`, `getCurrentFolder` to `RuleContextService`.
     *
     * @param mapFn Selector.
     * @param args Props.
     */
    select<K>(mapFn, ...args): Observable<K> {
        switch (mapFn) {
            case getRuleContext:
                return this.ruleContext$ as unknown as Observable<K>;
            case getAppSelection:
                return this.ruleContext$.pipe(map(({ selection }) => selection)) as unknown as Observable<K>;
            case getCurrentFolder:
                return this.ruleContext$.pipe(map((context) => context.navigation.currentFolder)) as unknown as Observable<K>;
            default:
                return super.select(mapFn, args);
        }
    }
}
