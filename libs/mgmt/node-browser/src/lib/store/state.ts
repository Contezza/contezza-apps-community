import { RouterReducerState } from '@ngrx/router-store';

import { ContezzaRouterState } from '@contezza/common';

import { NodeBrowserSearchParams, NodeBrowserSearchResponse } from '../interfaces/node-browser-search';

export interface ContezzaNodeBrowserState {
    router: RouterReducerState<ContezzaRouterState>;
    nodeBrowser: NodeBrowserState;
}

export interface NodeBrowserState {
    stores: Array<string>;
    lastSearchQuery: string;
    searchParams: NodeBrowserSearchParams;
    searchResponse: NodeBrowserSearchResponse;
    searchLoading: boolean;
    browseLoading: boolean;
    expandedPanelState: boolean;
}

export const initialState: NodeBrowserState = {
    stores: [],
    lastSearchQuery: undefined,
    searchParams: {
        q: 'PATH:"/"',
        lang: 'fts-alfresco',
        store: 'workspace://SpacesStore',
        maxResults: 100,
    },
    searchResponse: null,
    searchLoading: false,
    browseLoading: false,
    expandedPanelState: false,
};
