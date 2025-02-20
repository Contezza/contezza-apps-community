import { ActionCreator, createAction, props } from '@ngrx/store';

enum Type {
    APP_INITIALIZATION_SUCCESS = '[CORE] APP_INITIALIZATION_SUCCESS',
    ON_ACTION_SUCCESS = '[CORE] ON_ACTION_SUCCESS',
    REFRESH = '[CORE] REFRESH',
}

export const appInitializationSuccess = createAction(Type.APP_INITIALIZATION_SUCCESS);
export const onActionSuccess = createAction(Type.ON_ACTION_SUCCESS, props<{ payload: ActionCreator }>());
export const refresh = createAction(Type.REFRESH);
