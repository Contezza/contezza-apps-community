import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import { RouterReducerState } from '@ngrx/router-store';

import { ContezzaRouterState } from '@contezza/common';

import { ContezzaJsConsoleState, JsConsoleState } from './state';
import { featureKey } from './feature-key';

/*
 * Router selectors
 */

// eslint-disable-next-line @typescript-eslint/ban-types
export const selectRouterState: MemoizedSelector<object, RouterReducerState<ContezzaRouterState>> = createSelector(
    createFeatureSelector<ContezzaJsConsoleState>(featureKey),
    (state: ContezzaJsConsoleState) => state.router
);

export const selectRouter = createSelector(selectRouterState, (routerReducerState: RouterReducerState<ContezzaRouterState>) => routerReducerState?.state || {});
export const selectRouterQueryParams = createSelector(selectRouter, (routerState: ContezzaRouterState) => routerState?.queryParams || {});

/*
 * JS Console selectors
 */

// eslint-disable-next-line @typescript-eslint/ban-types
export const selectConsole: MemoizedSelector<object, JsConsoleState> = createSelector(
    createFeatureSelector<ContezzaJsConsoleState>(featureKey),
    (state: ContezzaJsConsoleState) => state.jsConsoleState
);

export const getEditorOptions = createSelector(selectConsole, (state) => state.editorOptions);
export const getExecuteScriptLoading = createSelector(selectConsole, (state) => state.executeScriptLoading);
export const getScriptExecutionTime = createSelector(selectConsole, (state) => state.executionTime);
export const getScriptsList = createSelector(selectConsole, (state) => state.scriptsList);
export const getSelectedScript = createSelector(selectConsole, (state) => state.selectedScript);
export const getJsConsoleContent = createSelector(selectConsole, (state) => state.jsContent);
export const getJsConsoleSelectedContent = createSelector(selectConsole, (state) => state.jsSelectedContent);
export const getFmConsoleContent = createSelector(selectConsole, (state) => state.fmContent);
export const getExecuteConsoleOutput = createSelector(selectConsole, (state) => state.output);
export const getSelectedNode = createSelector(selectRouterQueryParams, ({ nodeRef, name }) => ({ nodeRef: nodeRef ?? '', name: name ?? '' }));
export const getSelectedSpaceNode = createSelector(selectConsole, (state) => state.selectedSpaceNode);
export const getRunas = createSelector(selectConsole, (state) => state.runas);
export const getTransaction = createSelector(selectConsole, (state) => state.transaction);
export const getUrlargs = createSelector(selectConsole, (state) => state.urlargs);

export const getConsolePayloadInfo = createSelector(
    getJsConsoleContent,
    getJsConsoleSelectedContent,
    getFmConsoleContent,
    getSelectedNode,
    getSelectedSpaceNode,
    getRunas,
    getTransaction,
    getUrlargs,
    (js, jsSelected, fm, selectedNode, selectedSpaceNode, runas, transaction, urlargs) => ({
        js,
        jsSelected,
        fm,
        selectedNode,
        selectedSpaceNode,
        runas,
        transaction,
        urlargs,
    })
);
