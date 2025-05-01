import { RuleContext } from '@alfresco/adf-extensions';

/**
 * Checks if action target is search-table-page
 */
export const isSearchTablePage = (context) => context.target?.split?.('.')?.[0] === 'search-table-page';

/**
 * Checks if action-target id is in the list
 */
export const hasIdIn = (context: RuleContext & { target?: string }, ...ids: string[]) => {
    const { target } = context;
    if (target) {
        const dotIndex = target.indexOf('.');
        if (dotIndex > -1) {
            const id = target.slice(dotIndex + 1);
            return ids.includes(id);
        }
    }
    return false;
};

/**
 * Checks if action-target type is in the list
 */
export const hasTypeIn = (context, ...types: string[]) => types.includes(context.target?.split?.('.')?.[1]);
