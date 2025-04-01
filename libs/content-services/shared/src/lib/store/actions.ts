import { createAction, props } from '@ngrx/store';

import { NodeEntry } from '@alfresco/js-api';

export enum ActionType {
    MANAGE_PERMISSIONS = '[CONTENT_SERVICES] MANAGE_PERMISSIONS',
    NAVIGATE_TO_PARENT = '[CONTENT_SERVICES] NAVIGATE_TO_PARENT',
    ROTATE_FILE_IN_VIEWER = '[CONTENT_SERVICES] ROTATE_FILE_IN_VIEWER',
}

export const managePermissions = createAction(ActionType.MANAGE_PERMISSIONS, props<{ payload?: NodeEntry }>());
export const navigateToParent = createAction(ActionType.NAVIGATE_TO_PARENT, props<{ payload?: NodeEntry }>());
export const rotateFileInViewer = createAction(ActionType.ROTATE_FILE_IN_VIEWER);
