import { inject, Injectable, InjectionToken } from '@angular/core';

import {
    ExtensionElement,
    ExtensionLoaderService,
    reduceEmptyMenus,
    reduceSeparators,
    RuleContext,
    RuleEvaluator,
    RuleParameter,
    RuleService as AdfRuleService,
} from '@alfresco/adf-extensions';

import { ContezzaUtils, OrArray, Tree } from '@contezza/core/utils';

interface ExtensionElementWithRules extends ExtensionElement {
    rules?: {
        [key: string]: string;
        enabled?: string;
        visible?: string;
    };
}

type ExtensionElementWithRulesTree = Tree<ExtensionElementWithRules, 'children', '*'>;

const EVALUATORS = new InjectionToken<Record<string, RuleEvaluator>[]>('EVALUATORS');
export const provideEvaluators = (evaluators: Record<string, RuleEvaluator>) => ({
    provide: EVALUATORS,
    useValue: evaluators,
    multi: true,
});

type EvaluatorGroups = Record<string, AdfRuleService['evaluateRule']>;
const EVALUATOR_GROUPS = new InjectionToken<EvaluatorGroups[]>('EVALUATOR_GROUPS');
export const provideEvaluatorGroups = (evaluatorGroups: EvaluatorGroups) => ({
    provide: EVALUATOR_GROUPS,
    useValue: evaluatorGroups,
    multi: true,
});

/**
 * Extends RuleService, supporting:
 * - Evaluator groups, i.e. evaluators resolved based on regex instead of exact id.
 * - Logical operators `&&` and `||` (besides `!`) by evaluators. Priority is `! > && > ||`, parentheses are not supported.
 * - Evaluators with parameters, format is `evaluatorKey(parameters)` where `parameters` is an array for consistency with extension rules.
 * - Default evaluation to `false` for not-existing rules.
 * - Definition of evaluators via provider.
 */
@Injectable({ providedIn: 'root' })
export class RuleService extends AdfRuleService {
    static readonly provider = { provide: AdfRuleService, useExisting: RuleService };

    // constructor
    private readonly providedEvaluators = inject(EVALUATORS, { optional: true });
    private readonly providedEvaluatorGroups = inject(EVALUATOR_GROUPS, { optional: true });

    private readonly groups: EvaluatorGroups = {};

    // eslint-disable-next-line @angular-eslint/prefer-inject
    constructor(loader: ExtensionLoaderService) {
        super(loader);

        this.providedEvaluators?.forEach(list => this.setEvaluators(list));
        this.providedEvaluatorGroups?.forEach(list => this.setEvaluatorGroups(list));
    }

    setEvaluatorGroups(values: EvaluatorGroups) {
        Object.assign(this.groups, values);
    }

    getEvaluator(key: string): RuleEvaluator {
        if (key.includes('||')) {
            // support ||
            const evaluators = key.split('||').map(simpleKey => this.getEvaluator(simpleKey.trim()));
            return (context: RuleContext, ...args: RuleParameter[]): boolean => evaluators.some(fn => fn(context, ...args));
        } else if (key.includes('&&')) {
            // support &&
            const evaluators = key.split('&&').map(simpleKey => this.getEvaluator(simpleKey.trim()));
            return (context: RuleContext, ...args: RuleParameter[]): boolean => evaluators.every(fn => fn(context, ...args));
        } else if (key.startsWith('!')) {
            // support !
            const evaluator = this.getEvaluator(key.substring(1));
            return (context: RuleContext, ...args: RuleParameter[]): boolean => !evaluator(context, ...args);
        } else if (key.includes('([') && key.endsWith('])')) {
            // support evaluatorKey(parameters)
            const [evaluatorKey, paramsAsString] = key.slice(0, -1).split('(');
            // same as JSON.parse but more flexibel
            const params = ContezzaUtils.stringToFunction('_ => return ' + paramsAsString)();
            const evaluator = this.getElementaryEvaluator(evaluatorKey);
            // TODO: this has not been testen with group evaluators
            return context => evaluator(context, ...params);
        } else {
            return this.getElementaryEvaluator(key);
        }
    }

    private getElementaryEvaluator(key: string): RuleEvaluator {
        const evaluator = this.evaluators[key];
        if (!evaluator) {
            // look for a match with a group pattern
            // note that this is only applied if no exact match (rule or evaluator) is found
            const match = Object.entries(this.groups).find(([groupPattern]) => key.match(new RegExp(groupPattern)))?.[1];
            if (match) {
                return context => match(key, context);
            }
        }
        // if the evaluator does not exist, then the rule always evaluates to false
        return evaluator || (() => false);
    }

    /**
     * Evaluates a rule.
     * Wraps the default `AdfRuleService.evaluateRule` to return false if the rule evaluation raises any error.
     * This was the default behaviour before ADF 7.
     *
     * @param ruleId ID of the rule to evaluate
     * @param context Custom rule execution context.
     * @returns True if the rule passed, false otherwise
     */
    evaluateRule(ruleId: string, context?: RuleContext): boolean {
        try {
            return super.evaluateRule(ruleId, context);
        } catch (e) {
            console.warn(e);
            return false;
        }
    }

    /**
     * Applies adf extension filter to the given list based on the given rule context.
     * This was originally implemented as action filter and now refactored so that it can be applied to any list of extension elements with rules.
     *
     * @param list
     * @param context
     */
    filterList<T extends ExtensionElementWithRulesTree>(list: T[], context: RuleContext): T[] {
        const flt = (l: T[]): T[] =>
            l
                .filter(li => this.filterItem(li, context))
                .map(li => this.setDisabledFromRule(li, context))
                .reduce(reduceEmptyMenus as any, [])
                .reduce(reduceSeparators, []);
        const recursion = (l: T[]): T[] => flt(l.map(li => (li.children?.length ? { ...li, children: recursion(li.children as T[]) } : li)));
        return recursion(list || []);
    }

    filterItem<T extends { rules?: { visible?: OrArray<string> } }>(item: T, context: RuleContext): boolean {
        if (item?.rules?.visible) {
            if (Array.isArray(item.rules.visible)) {
                return item.rules.visible.every(rule => this.evaluateRule(rule, context));
            }
            return this.evaluateRule(item.rules.visible, context);
        }
        return true;
    }

    private setDisabledFromRule<T extends { rules?: { enabled?: string } }>(item: T, context: RuleContext): T & { disabled: boolean } {
        return { ...item, disabled: item?.rules?.enabled ? !this.evaluateRule(item.rules.enabled, context) : false };
    }
}
