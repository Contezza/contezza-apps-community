import { createAction, props } from '@ngrx/store';

import { GenericBucket } from '@alfresco/js-api';

export interface NavigateToResultPayload {
    q: string;
    bucket?: GenericBucket & { id: string };
}

export enum ActionType {
    NAVIGATE_TO_RESULTS = '[CONTENT_SERVICES.SEARCH] NAVIGATE_TO_RESULTS',
}

export const navigateToResults = createAction(ActionType.NAVIGATE_TO_RESULTS, props<{ payload: NavigateToResultPayload }>());
