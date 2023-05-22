import { Node } from '@alfresco/js-api';
import { ExtensionElement, filterEnabled, RuleContext, RuleEvaluator, sortByOrder } from '@alfresco/adf-extensions';

export class ContezzaAdfUtils {
    static filterAndSortFeature<T extends ExtensionElement & { children?: T[] }>(feature: T[]): T[] {
        const filterAndSort = (list: T[]): T[] => list.filter(filterEnabled).sort(sortByOrder);
        const recursion = (list: T[]): T[] => {
            list.filter((item) => item.children?.length > 0).forEach((item) => (item.children = recursion(item.children)));
            return filterAndSort(list);
        };
        return recursion(feature);
    }

    /**
     * Given a simple node `evaluator`, makes the following `RuleEvaluator`'s:
     * - `${prefix}.selection.${id}` evaluates to `true` if and only if the selection is not empty and `evaluator` evaluates to `true` for every selected node;
     * - `${prefix}.selection.!${id}` evaluates to `true` if and only if the selection is not empty and `evaluator` evaluates to `false` for every selected node;
     * - `${prefix}.current-folder.${id}` evaluates to `true` if and only if a current folder is defined and `evaluator` evaluates to `true` for the current folder.
     *
     * The returned object can be directly given as parameter to `ExtensionService.setEvaluators`.
     *
     * @param id Unique rule id used to make the unique id of the `RuleEvaluator`.
     * @param evaluator Boolean function which takes a node as parameter and the rest of the rule context as optional parameter.
     * @param options Optional parameters: `prefix` (omitted by default) and `separator` (defaults to `.`) are used to make the unique id of the `RuleEvaluator`.
     */
    static makeRules(
        id: string,
        evaluator: (node: Node, context?: Omit<RuleContext, 'selection' | 'navigation'>) => boolean,
        options?: { prefix?: string; separator?: string }
    ): Record<string, RuleEvaluator> {
        return {
            [[options?.prefix, 'selection', id].filter(Boolean).join(options?.separator ?? '.')]: (context) =>
                !context.selection.isEmpty && context.selection.nodes.every(({ entry }) => evaluator(entry, context)),
            [[options?.prefix, 'selection', `!${id}`].filter(Boolean).join(options?.separator ?? '.')]: (context) =>
                !context.selection.isEmpty && context.selection.nodes?.every(({ entry }) => !evaluator(entry, context)),
            [[options?.prefix, 'current-folder', id].filter(Boolean).join(options?.separator ?? '.')]: (context) =>
                !!context.navigation.currentFolder && evaluator(context.navigation.currentFolder, context),
        };
    }
}
