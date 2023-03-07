import { Action, on } from '@ngrx/store';

import { createLocalStorageRehydrateReducer } from '@contezza/common';

import { NodeBrowserActions } from './index';
import { initialState, NodeBrowserState } from './state';

export const nodeBrowserKey = 'nodeBrowser';

const reducer = createLocalStorageRehydrateReducer(
    nodeBrowserKey,
    initialState,

    on(NodeBrowserActions.setStores, (state: NodeBrowserState, { stores }) => ({ ...state, stores })),
    on(NodeBrowserActions.setLastSearchQuery, (state: NodeBrowserState, { lastSearchQuery }) => ({ ...state, lastSearchQuery })),
    on(NodeBrowserActions.setSearchParam, (state: NodeBrowserState, { param, value }) => ({
        ...state,
        searchParams: {
            ...state.searchParams,
            [param]: value,
        },
    })),
    on(NodeBrowserActions.setSearchResponse, (state: NodeBrowserState, { searchResponse }) => ({ ...state, searchResponse })),
    on(NodeBrowserActions.setSearchLoading, (state: NodeBrowserState, { searchLoading }) => ({ ...state, searchLoading })),
    on(NodeBrowserActions.setBrowseLoading, (state: NodeBrowserState, { browseLoading }) => ({ ...state, browseLoading })),
    on(NodeBrowserActions.setExpandedPanelState, (state: NodeBrowserState, { expandedPanelState }) => ({ ...state, expandedPanelState }))
);

export const nodeBrowserReducer = (state: NodeBrowserState | undefined, action: Action) => reducer(state, action);
