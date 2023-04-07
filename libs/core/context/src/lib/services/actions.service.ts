import { Inject, Injectable, InjectionToken, Optional, Provider } from '@angular/core';

import { Store } from '@ngrx/store';

import { BehaviorSubject, Observable } from 'rxjs';
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
    private readonly allActions$: Observable<ContentActionRef[]> = this.featureKeySource.pipe(
        filter((value) => !!value),
        map((featureKey) => ContezzaAdfUtils.filterAndSortFeature(this.extensions.getFeature(featureKey)))
    );

    readonly actions$: Observable<ContentActionRef[]> = this.allActions$.pipe(
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

    runActionById(id: string) {
        this.store.dispatch({ type: id });
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
