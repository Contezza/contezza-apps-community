import { createAction, props } from '@ngrx/store';

import { NodeEntry } from '@alfresco/js-api';

import { RmauditlogEntry } from '@contezza/alfresco/rm/apis';

export enum ActionType {
    READ_RMAUDITLOG = '[ALFRESCO.RM] READ_RMAUDITLOG',
    SHOW_AUDITLOG_DETAILS = '[ALFRESCO.RM] SHOW_AUDITLOG_DETAILS',
}

export const readRmauditlog = createAction(ActionType.READ_RMAUDITLOG, props<{ payload?: NodeEntry }>());
export const showAuditlogDetails = createAction(ActionType.SHOW_AUDITLOG_DETAILS, props<{ payload?: RmauditlogEntry }>());
