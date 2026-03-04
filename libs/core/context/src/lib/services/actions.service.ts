import { Inject, Injectable, InjectionToken, Optional, Provider } from '@angular/core';

import { Store } from '@ngrx/store';

import { BehaviorSubject, filter, map, merge, Observable, switchMap, take, tap } from 'rxjs';

import { AppExtensionService } from '@alfresco/aca-shared';
import { ContentActionRef, ContentActionType, ExtensionService, reduceEmptyMenus, reduceSeparators, RuleContext } from '@alfresco/adf-extensions';

import { RuleService } from '@contezza/core/extensions';
import { ContezzaAdfUtils } from '@contezza/core/utils';

import { RuleContextService } from './rule-context.service';

const FEATURE_KEY = new InjectionToken<string>('feature-key');

export enum ActionTrigger {
    CONTEXT_MENU = 'CONTEXT_MENU',
    FLOATING_BUTTON = 'FLOATING_BUTTON',
    TOOLBAR = 'TOOLBAR',
}

@Injectable()
export class ActionsService {
    static provider: Provider[] = [ActionsService, { provide: AppExtensionService, useExisting: ActionsService }];
    static withFeatureKey: (_: string) => Provider[] = (useValue: string) => [
        { provide: FEATURE_KEY, useValue },
        ActionsService,
        { provide: AppExtensionService, useExisting: ActionsService },
    ];

    private readonly featureKeySource = new BehaviorSubject<string>(undefined);
    private readonly allActionsSource = new BehaviorSubject<ContentActionRef[]>(undefined);
    private readonly allActions$: Observable<ContentActionRef[]> = merge(
        this.featureKeySource.pipe(
            filter(value => !!value),
            map(featureKey => this.extensions.getFeature(featureKey)),
        ),
        this.allActionsSource.pipe(filter(value => !!value)),
    );

    readonly actions$: Observable<ContentActionRef[]> = this.allActions$.pipe(
        map(allActions => ContezzaAdfUtils.filterAndSortFeature(allActions)),
        tap(allActions => allActions.forEach(ContezzaAdfUtils.setActionDefaults)),
        switchMap(allActions => this.ruleContext$.pipe(map(context => this.getAllowedActions(allActions, context)))),
    );

    private _trigger?: ActionTrigger;
    set trigger(trigger: ActionTrigger) {
        this._trigger = trigger;
    }

    constructor(
        private readonly store: Store,
        private readonly extensions: ExtensionService,
        private readonly rules: RuleService,
        private readonly ruleContext$: RuleContextService,
        @Optional() @Inject(FEATURE_KEY) featureKey: string,
    ) {
        if (featureKey) {
            this.featureKey = featureKey;
        }
    }

    set featureKey(key: string) {
        this.featureKeySource.next(key);
    }

    set actions(actions: ContentActionRef[]) {
        this.allActionsSource.next(actions);
    }

    runActionById(id: string, additionalPayload?: object) {
        const action = this.extensions.getActionById(id);
        if (action) {
            this.ruleContext$.pipe(take(1)).subscribe(context => {
                this.store.dispatch({
                    ...action,
                    ...(action.payload ? { payload: this.extensions.runExpression(action.payload, context) } : {}),
                    ...additionalPayload,
                    ...(this._trigger ? { trigger: this._trigger } : {}),
                });
            });
        } else {
            this.store.dispatch({
                type: id,
                ...additionalPayload,
                ...(this._trigger ? { trigger: this._trigger } : {}),
            });
        }
    }

    private getAllowedActions(actions: ContentActionRef[], context: RuleContext): ContentActionRef[] {
        const actionsFilter = (list: ContentActionRef[]): ContentActionRef[] =>
            list
                .filter(action => this.rules.filterItem(action, context))
                .map(action => {
                    if (action.type === ContentActionType.custom && !action.data) {
                        action.data = { ...action };
                    }
                    return action;
                })
                .map(action => this.setActionDisabledFromRule(action, context))
                .reduce(reduceEmptyMenus, [])
                .reduce(reduceSeparators, []);
        const recursion = (list: ContentActionRef[]): ContentActionRef[] =>
            actionsFilter(list.map(item => (item.children?.length ? { ...item, children: recursion(item.children) } : item)));
        return recursion(actions || []);
    }

    private setActionDisabledFromRule(action: ContentActionRef, context: RuleContext) {
        return { ...action, disabled: action?.rules?.enabled ? !this.extensions.evaluateRule(action.rules.enabled, context) : false };
    }
}
