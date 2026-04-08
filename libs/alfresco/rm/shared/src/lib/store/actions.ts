import { createAction, props } from '@ngrx/store';

import { NodeEntry } from '@alfresco/js-api';

export enum ActionType {
    READ_RMAUDITLOG = '[ALFRESCO.RM] READ_RMAUDITLOG',
}

export const readRmauditlog = createAction(ActionType.READ_RMAUDITLOG, props<{ payload?: NodeEntry }>());
