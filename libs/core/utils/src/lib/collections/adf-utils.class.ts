import { ExtensionElement, filterEnabled, sortByOrder } from '@alfresco/adf-extensions';

export class ContezzaAdfUtils {
    static filterAndSortFeature<T extends ExtensionElement & { children?: T[] }>(feature: T[]): T[] {
        const filterAndSort = (list: T[]): T[] => list.filter(filterEnabled).sort(sortByOrder);
        const recursion = (list: T[]): T[] => {
            list.filter((item) => item.children?.length > 0).forEach((item) => (item.children = recursion(item.children)));
            return filterAndSort(list);
        };
        return recursion(feature);
    }
}
