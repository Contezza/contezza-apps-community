import { Inject, Injectable, InjectionToken, Optional, Provider } from '@angular/core';

import { Store } from '@ngrx/store';

import { BehaviorSubject, merge, Observable } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';

import { ContentActionRef, ContentActionType, ExtensionService, reduceEmptyMenus, reduceSeparators, RuleContext } from '@alfresco/adf-extensions';
import { AppExtensionService } from '@alfresco/aca-shared';

import { ContezzaAdfUtils } from '@contezza/core/utils';

import { RuleContextService } from './rule-context.service';

const FEATURE_KEY = new InjectionToken<string>('feature-key');

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
            filter((value) => !!value),
            map((featureKey) => this.extensions.getFeature(featureKey))
        ),
        this.allActionsSource.pipe(filter((value) => !!value))
    );

    readonly actions$: Observable<ContentActionRef[]> = this.allActions$.pipe(
        map((allActions) => ContezzaAdfUtils.filterAndSortFeature(allActions)),
        switchMap((allActions) => this.ruleContext$.pipe(map((context) => this.getAllowedActions(allActions, context))))
    );

    constructor(
        private readonly store: Store,
        private readonly extensions: ExtensionService,
        private readonly ruleContext$: RuleContextService,
        @Optional() @Inject(FEATURE_KEY) featureKey: string
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
            this.store.dispatch({
                ...action,
                ...additionalPayload,
            });
        } else {
            this.store.dispatch({
                type: id,
                ...additionalPayload,
            });
        }
    }

    private getAllowedActions(actions: ContentActionRef[], context: RuleContext): ContentActionRef[] {
        const actionsFilter = (list: ContentActionRef[]): ContentActionRef[] =>
            list
                .filter((action) => this.filterVisible(action, context))
                .map((action) => {
                    if (action.type === ContentActionType.custom && !action.data) {
                        action.data = { ...action };
                    }
                    return action;
                })
                .map((action) => this.setActionDisabledFromRule(action, context))
                .reduce(reduceEmptyMenus, [])
                .reduce(reduceSeparators, []);
        const recursion = (list: ContentActionRef[]): ContentActionRef[] =>
            actionsFilter(list.map((item) => (item.children?.length ? { ...item, children: recursion(item.children) } : item)));
        return recursion(actions || []);
    }

    private filterVisible(action: ContentActionRef, context: RuleContext): boolean {
        return action?.rules?.visible ? this.extensions.evaluateRule(action.rules.visible, context) : true;
    }

    private setActionDisabledFromRule(action: ContentActionRef, context: RuleContext) {
        return { ...action, disabled: action?.rules?.enabled ? !this.extensions.evaluateRule(action.rules.enabled, context) : false };
    }
}
