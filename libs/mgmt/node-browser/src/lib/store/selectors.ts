import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import { RouterReducerState } from '@ngrx/router-store';

import { ContezzaRouterState } from '@contezza/common';

import { ContezzaNodeBrowserState, NodeBrowserState } from './state';
import { featureKey } from './store.module';

/*
 * Router selectors
 */

// eslint-disable-next-line @typescript-eslint/ban-types
export const selectRouterState: MemoizedSelector<object, RouterReducerState<ContezzaRouterState>> = createSelector(
    createFeatureSelector<ContezzaNodeBrowserState>(featureKey),
    (state: ContezzaNodeBrowserState) => state.router
);

export const selectRouter = createSelector(selectRouterState, (routerReducerState: RouterReducerState<ContezzaRouterState>) => routerReducerState?.state || {});
export const selectRouterParams = createSelector(selectRouter, (routerState: ContezzaRouterState) => routerState?.params || {});

/*
 * Node Browser selectors
 */

// eslint-disable-next-line @typescript-eslint/ban-types
export const selectNodeBrowser: MemoizedSelector<object, NodeBrowserState> = createSelector(
    createFeatureSelector<ContezzaNodeBrowserState>(featureKey),
    (state: ContezzaNodeBrowserState) => state.nodeBrowser
);

export const getStores = createSelector(selectNodeBrowser, (state) => state.stores);
export const getLastSearchQuery = createSelector(selectNodeBrowser, (state) => state.lastSearchQuery);
export const getSearchParams = createSelector(selectNodeBrowser, (state) => state.searchParams);
export const getSearchResponse = createSelector(selectNodeBrowser, (state) => state.searchResponse);
export const getSearchLoading = createSelector(selectNodeBrowser, (state) => state.searchLoading);
export const getBrowseLoading = createSelector(selectNodeBrowser, (state) => state.browseLoading);
export const getExpandedPanelState = createSelector(selectNodeBrowser, (state) => state.expandedPanelState);
export const getBrowseNodeRef = createSelector(selectRouterParams, ({ nodeRef }) => nodeRef);
