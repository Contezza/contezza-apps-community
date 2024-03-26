import { Node } from '@alfresco/js-api';
import { ContentActionRef, ContentActionType, ExtensionElement, filterEnabled, RuleContext, RuleEvaluator, sortByOrder } from '@alfresco/adf-extensions';

export class AdfUtils {
    static readonly prefixSpacesStore = 'workspace://SpacesStore/';

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
     * - `${prefix}.selection.file.${id}` evaluates to `true` if and only if the selection consists of a single file and `evaluator` evaluates to `true` for the selected file;
     * - `${prefix}.selection.folder.${id}` evaluates to `true` if and only if the selection consists of a single folder and `evaluator` evaluates to `true` for the selected folder;
     * - `${prefix}.current-folder.${id}` evaluates to `true` if and only if a current folder is defined and `evaluator` evaluates to `true` for the current folder.
     *
     * The returned object can be directly given as parameter to `ExtensionService.setEvaluators`.
     *
     * @param id Unique rule id used to make the unique id of the `RuleEvaluator`.
     * @param evaluator Boolean function which takes a node as parameter and the rest of the rule context and arguments as optional parameters.
     * @param options Optional parameters: `prefix` (defaults to `app`) and `separator` (defaults to `.`) are used to make the unique id of the `RuleEvaluator`.
     * @returns `RuleEvaluator` record that can be directly given as parameter to `ExtensionService.setEvaluators`.
     */
    static makeRules(
        id: string,
        evaluator: (node: Node, context?: Omit<RuleContext, 'selection' | 'navigation'>, ...args: any[]) => boolean,
        options?: { prefix?: string; separator?: string }
    ): Record<string, RuleEvaluator> {
        const prefix = options?.prefix ?? 'app';
        const separator = options?.separator ?? '.';
        return {
            [[prefix, 'selection', id].join(separator)]: (context, ...args) =>
                !context.selection.isEmpty && context.selection.nodes.every(({ entry }) => evaluator(entry, context, args)),
            [[prefix, 'selection', `!${id}`].join(separator)]: (context, ...args) =>
                !context.selection.isEmpty && context.selection.nodes?.every(({ entry }) => !evaluator(entry, context, args)),
            [[prefix, 'selection', 'file', id].join(separator)]: (context, ...args) => context.selection.file && evaluator(context.selection.file.entry, context, args),
            [[prefix, 'selection', 'folder', id].join(separator)]: (context, ...args) => context.selection.folder && evaluator(context.selection.folder.entry, context, args),
            [[prefix, 'current-folder', id].join(separator)]: (context, ...args) =>
                !!context.navigation.currentFolder && evaluator(context.navigation.currentFolder, context, args),
        };
    }

    /**
     * Fills a `ContentActionRef` object with default properties (type and icon).
     * Analogous to `@alfresco/adf-extensions/ExtensionLoaderService.setActionDefaults`.
     *
     * @param action
     */
    static setActionDefaults(action: ContentActionRef) {
        action.type ??= ContentActionType.default;
        action.icon ??= 'extension';
        if (action.children?.length) {
            action.children.forEach((child) => ContezzaAdfUtils.setActionDefaults(child));
        }
    }
}

/**
 * @deprecated
 */
export class ContezzaAdfUtils extends AdfUtils {}
