import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';

import { selectQueryParams } from '@contezza/core/stores';

import { ContezzaJsConsoleState, JsConsoleState } from './state';
import { featureKey } from './feature-key';

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
export const getSelectedNode = createSelector(selectQueryParams, ({ nodeRef, name }) => ({ nodeRef: nodeRef ?? '', name: name ?? '' }));
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
