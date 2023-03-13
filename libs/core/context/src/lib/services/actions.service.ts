import { Inject, Injectable, InjectionToken, Provider } from '@angular/core';

import { Store } from '@ngrx/store';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ContentActionRef, ContentActionType, ExtensionService, reduceEmptyMenus, reduceSeparators, RuleContext } from '@alfresco/adf-extensions';
import { AppExtensionService } from '@alfresco/aca-shared';

import { ContezzaAdfUtils } from '@contezza/core/utils';

import { RuleContextService } from './rule-context.service';

const FEATURE_KEY = new InjectionToken<string>('feature-key');

@Injectable()
export class ActionsService {
    static withFeatureKey: (_: string) => Provider[] = (useValue: string) => [
        { provide: FEATURE_KEY, useValue },
        ActionsService,
        { provide: AppExtensionService, useExisting: ActionsService },
    ];

    private readonly actions: ContentActionRef[] = ContezzaAdfUtils.filterAndSortFeature(this.extensions.getFeature(this.featureKey));

    readonly actions$: Observable<ContentActionRef[]> = this.ruleContext$.pipe(map((context) => this.getAllowedActions(this.actions, context)));

    constructor(
        private readonly store: Store,
        private readonly extensions: ExtensionService,
        private readonly ruleContext$: RuleContextService,
        @Inject(FEATURE_KEY) private readonly featureKey: string
    ) {}

    runActionById(id: string) {
        this.store.dispatch({ type: id });
    }

    private getAllowedActions(actions: ContentActionRef[], context: RuleContext): ContentActionRef[] {
        const filter = (list: ContentActionRef[]): ContentActionRef[] =>
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
            filter(list.map((item) => (item.children?.length ? { ...item, children: recursion(item.children) } : item)));
        return recursion(actions || []);
    }

    private filterVisible(action: ContentActionRef, context: RuleContext): boolean {
        return action?.rules?.visible ? this.extensions.evaluateRule(action.rules.visible, context) : true;
    }

    private setActionDisabledFromRule(action: ContentActionRef, context: RuleContext) {
        return { ...action, disabled: action?.rules?.enabled ? !this.extensions.evaluateRule(action.rules.enabled, context) : false };
    }
}
