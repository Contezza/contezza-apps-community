import { NodeBrowserSearchParams, NodeBrowserSearchResponse } from '../interfaces/node-browser-search';

export interface ContezzaNodeBrowserState {
    nodeBrowserState: NodeBrowserState;
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
