import { createFeatureSelector, createSelector } from '@ngrx/store';
import { RouterReducerState } from '@ngrx/router-store';

import { featureKey } from './feature-key';
import { ContezzaRouterState } from './state';

const selectRouter = createFeatureSelector<RouterReducerState<ContezzaRouterState>>(featureKey);

export const selectRouterState = createSelector(selectRouter, ({ state }) => state);

export const selectUrl = createSelector(selectRouterState, (routerState) => routerState.url);
export const selectRouteParams = createSelector(selectRouterState, (routerState) => routerState.params);
export const selectQueryParams = createSelector(selectRouterState, (routerState) => routerState.queryParams);
export const selectFragment = createSelector(selectRouterState, (routerState) => routerState.fragment);
