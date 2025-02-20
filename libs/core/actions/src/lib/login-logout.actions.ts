import { createAction } from '@ngrx/store';

enum Type {
    LOGIN = '[CORE] LOGIN',
    LOGOUT = '[CORE] LOGOUT',
}

export const login = createAction(Type.LOGIN);
export const logout = createAction(Type.LOGOUT);
