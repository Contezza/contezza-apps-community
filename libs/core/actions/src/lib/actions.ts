import { Router } from '@angular/router';

import { ActionCreator, createAction, props } from '@ngrx/store';

export enum ActionType {
    APP_INITIALIZATION_SUCCESS = '[CORE] APP_INITIALIZATION_SUCCESS',
    NAVIGATE = '[CORE] NAVIGATE',
    ON_ACTION_SUCCESS = '[CORE] ON_ACTION_SUCCESS',
    REFRESH = '[CORE] REFRESH',
}

export const appInitializationSuccess = createAction(ActionType.APP_INITIALIZATION_SUCCESS);
/**
 * Wraps `Router.navigate()`.
 */
export const navigate = createAction(ActionType.NAVIGATE, props<{ payload: Parameters<Router['navigate']> }>());
export const onActionSuccess = createAction(ActionType.ON_ACTION_SUCCESS, props<{ payload: ActionCreator }>());
export const refresh = createAction(ActionType.REFRESH);
