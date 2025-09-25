import { createAction, props } from '@ngrx/store';

import { Notification } from '../models';

export enum ActionType {
    OPEN_LOADING_DIALOG = '[NOTIFICATIONS] OPEN_LOADING_DIALOG',
    CLOSE_LOADING_DIALOG = '[NOTIFICATIONS] CLOSE_LOADING_DIALOG',
    OPEN_ERROR_DETAILS_DIALOG = '[NOTIFICATIONS] OPEN_ERROR_DETAILS_DIALOG',
    // snackbar - replace ACA snackbar actions which are removed in 7.0.0
    SHOW_SNACKBAR_INFO = '[NOTIFICATIONS] SHOW_SNACKBAR_INFO',
    SHOW_SNACKBAR_ERROR = '[NOTIFICATIONS] SHOW_SNACKBAR_ERROR',
}

// loading dialog
export const openLoadingDialog = createAction(ActionType.OPEN_LOADING_DIALOG, props<Notification>());
export const closeLoadingDialog = createAction(ActionType.CLOSE_LOADING_DIALOG);

// error dialog
export const openErrorDetailsDialog = createAction(ActionType.OPEN_ERROR_DETAILS_DIALOG, props<{ payload: { message: string; details: any; duration?: number } }>());

// snackbar - replace ACA snackbar actions which are removed in 7.0.0
export const showSnackbarInfo = createAction(ActionType.SHOW_SNACKBAR_INFO, props<{ payload: string | { message: string; interpolateArgs?: any } }>());
export const showSnackbarError = createAction(ActionType.SHOW_SNACKBAR_ERROR, props<{ payload: string | { message: string; interpolateArgs?: any } }>());
