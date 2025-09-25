import { showSnackbarError, showSnackbarInfo } from './actions';

/**
 * Helper function created to facilitate the refactoring with ACA 7.0.0.
 * This function has the same signature as the constructor of `SnackbarInfoAction`, so it suffices to replace `new SnackbarInfoAction` with `makeShowSnackbarInfoAction` without touching the parameters.
 * @deprecated Use the corresponding ActionCreator directly instead.
 */
export const makeShowSnackbarInfoAction = (message: string, interpolateArgs?: any) => showSnackbarInfo({ payload: { message, interpolateArgs } });

/**
 * Helper function created to facilitate the refactoring with ACA 7.0.0.
 * This function has the same signature as the constructor of `SnackbarErrorAction`, so it suffices to replace `new SnackbarErrorAction` with `makeShowSnackbarErrorAction` without touching the parameters.
 * @deprecated Use the corresponding ActionCreator directly instead.
 */
export const makeShowSnackbarErrorAction = (message: string, interpolateArgs?: any) => showSnackbarError({ payload: { message, interpolateArgs } });
