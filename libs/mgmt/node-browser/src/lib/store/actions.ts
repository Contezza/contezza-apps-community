import { createAction, props } from '@ngrx/store';

import { NodeBrowserSearchParams, NodeBrowserSearchResponse } from '../interfaces/node-browser-search';

enum NodeBrowserActionTypes {
    LoadStores = '[NODE BROWSER] LOAD_STORES',
    SetStores = '[NODE BROWSER] SET_STORES',
    ExecuteSearch = '[NODE BROWSER] EXECUTE_SEARCH',
    SetLastSearchQuery = '[NODE BROWSER] SET_LAST_SEARCH_QUERY',
    SetSearchParam = '[NODE BROWSER] SET_SEARCH_PARAM',
    SetSearchResponse = '[NODE BROWSER] SET_SEARCH_RESPONSE',
    SetSearchLoading = '[NODE BROWSER] SET_SEARCH_LOADING',
    SetBrowseLoading = '[NODE BROWSER] SET_BROWSE_LOADING',
    NodeBrowse = '[NODE BROWSER] NODE_BROWSE',
    SetExpandedPanelState = '[NODE BROWSER] SET_EXPANDED_PANEL_STATE',
    TogglePanels = '[NODE BROWSER] TOGGLE_PANELS',
}

export const loadStores = createAction(NodeBrowserActionTypes.LoadStores);
export const setStores = createAction(NodeBrowserActionTypes.SetStores, props<{ stores: Array<string> }>());
export const executeSearch = createAction(NodeBrowserActionTypes.ExecuteSearch, props<{ params: NodeBrowserSearchParams }>());
export const setLastSearchQuery = createAction(NodeBrowserActionTypes.SetLastSearchQuery, props<{ lastSearchQuery: string }>());
export const setSearchParam = createAction(NodeBrowserActionTypes.SetSearchParam, props<{ param: string; value: string | number }>());
export const setSearchResponse = createAction(NodeBrowserActionTypes.SetSearchResponse, props<{ searchResponse: NodeBrowserSearchResponse }>());
export const setSearchLoading = createAction(NodeBrowserActionTypes.SetSearchLoading, props<{ searchLoading: boolean }>());
export const setBrowseLoading = createAction(NodeBrowserActionTypes.SetBrowseLoading, props<{ browseLoading: boolean }>());
export const nodeBrowse = createAction(NodeBrowserActionTypes.NodeBrowse, props<{ nodeRef: string }>());
export const setExpandedPanelState = createAction(NodeBrowserActionTypes.SetExpandedPanelState, props<{ expandedPanelState: boolean }>());
export const togglePanels = createAction(NodeBrowserActionTypes.TogglePanels, props<{ expanded: boolean }>());
