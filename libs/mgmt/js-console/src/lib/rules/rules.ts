import { RuleContext } from '@alfresco/adf-extensions';
import { isAdmin } from '@alfresco/aca-shared/rules';

/**
 * Checks if user can open the node in the javascript console.
 * JSON ref: `jsconsole.selection.canOpenInJavascriptConsole`
 */
export const canOpenInJavascriptConsole = (context: RuleContext): boolean => isAdmin(context) && hasAllowedSelection(context);

/**
 * Checks node selection.
 * - only single selection
 * - only files and folders
 * - isn't located in trashcan
 */
const hasAllowedSelection = (context: RuleContext): boolean => {
    const selection = context?.selection;

    return (
        !!selection &&
        !selection.isEmpty &&
        selection.count === 1 &&
        (selection.last.entry.isFile || selection.last.entry.isFolder) &&
        !context.navigation.url.startsWith('/trashcan')
    );
};
