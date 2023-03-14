import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';

import { selectRouteParams } from '@contezza/core/stores';

import { ContezzaNodeBrowserState, NodeBrowserState } from './state';
import { featureKey } from './feature-key';

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
export const getBrowseNodeRef = createSelector(selectRouteParams, ({ nodeRef }) => nodeRef);
