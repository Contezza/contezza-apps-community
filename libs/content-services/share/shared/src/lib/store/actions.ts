import { createAction, props } from '@ngrx/store';

import { NodeEntry } from '@alfresco/js-api';

import { ShareActionPayload } from '../models';

export enum ActionType {
    SHARE = '[CONTENT_SERVICES.SHARE] SHARE',

    // channel actions
    EMAIL = '[CONTENT_SERVICES.SHARE] EMAIL',
    SHOW = '[CONTENT_SERVICES.SHARE] SHOW',
}

export const share = createAction(ActionType.SHARE, props<{ payload?: NodeEntry[] }>());

// channel actions
export const email = createAction(ActionType.EMAIL, props<{ payload: ShareActionPayload }>());
export const show = createAction(ActionType.SHOW, props<{ payload: ShareActionPayload }>());
