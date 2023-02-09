import { Action, ActionCreator, ActionReducer, ActionType, createReducer } from '@ngrx/store';

// From: https://medium.com/betsson-group/the-easiest-way-to-keep-ngrx-state-after-refresh-rehydrate-it-from-localstorage-8cd23b547aac
export function createLocalStorageRehydrateReducer<S, A extends Action = Action>(key: string, initialState: S, ...ons: any[]): ActionReducer<S, A> {
    const item = localStorage.getItem(key);
    const newInitialState = (item && JSON.parse(item)) ?? initialState;

    const newOns: any[] = [];
    ons.forEach((oldOn: any) => {
        const newReducer: ActionReducer<S, A> = (state: S | undefined, action: ActionType<ActionCreator[][number]>) => {
            const newState = oldOn.reducer(state, action);
            localStorage.setItem(key, JSON.stringify(newState));
            return newState;
        };
        newOns.push({ ...oldOn, reducer: newReducer });
    });
    return createReducer(newInitialState, ...newOns);
}
