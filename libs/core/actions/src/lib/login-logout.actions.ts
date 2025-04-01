import { createAction } from '@ngrx/store';

export enum LoginLogoutActionType {
    LOGIN = '[CORE] LOGIN',
    LOGOUT = '[CORE] LOGOUT',
}

export const login = createAction(LoginLogoutActionType.LOGIN);
export const logout = createAction(LoginLogoutActionType.LOGOUT);
