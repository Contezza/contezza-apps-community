import { Action, on } from '@ngrx/store';

import { createLocalStorageRehydrateReducer } from '@contezza/utils';

import { JsConsoleActions } from './index';
import { initialState, JsConsoleState } from './state';

export const jsConsoleKey = 'jsConsoleState';

const reducer = createLocalStorageRehydrateReducer(
    jsConsoleKey,
    initialState,

    on(JsConsoleActions.setExecuteScriptLoading, (state: JsConsoleState, { executeScriptLoading }) => ({ ...state, executeScriptLoading })),
    on(JsConsoleActions.setScriptExecutionTime, (state: JsConsoleState, { executionTime }) => ({ ...state, executionTime })),
    on(JsConsoleActions.setJsConsoleContent, (state: JsConsoleState, { jsContent }) => ({ ...state, jsContent })),
    on(JsConsoleActions.setJsConsoleSelectedContent, (state: JsConsoleState, { jsSelectedContent }) => ({ ...state, jsSelectedContent })),
    on(JsConsoleActions.setFmConsoleContent, (state: JsConsoleState, { fmContent }) => ({ ...state, fmContent })),
    on(JsConsoleActions.setConsoleOutput, (state: JsConsoleState, { output }) => ({ ...state, output })),
    on(JsConsoleActions.setSelectedSpaceNode, (state: JsConsoleState, { selectedSpaceNode }) => ({ ...state, selectedSpaceNode })),
    on(JsConsoleActions.setRunas, (state: JsConsoleState, { runas }) => ({ ...state, runas })),
    on(JsConsoleActions.setTransaction, (state: JsConsoleState, { transaction }) => ({ ...state, transaction })),
    on(JsConsoleActions.setUrlargs, (state: JsConsoleState, { urlargs }) => ({ ...state, urlargs })),

    on(JsConsoleActions.loadScriptsListSuccess, (state: JsConsoleState, { scriptsList }) => ({
        ...state,
        scriptsList,
        selectedScript: state.selectedScript && scriptsList.find((s) => state.selectedScript.text === s.text) ? state.selectedScript : undefined,
    })),
    on(JsConsoleActions.setSelectedScript, (state: JsConsoleState, { selectedScript }) => ({
        ...{
            ...state,
            selectedScript,
        },
        ...(!selectedScript
            ? {
                  jsContent: '',
                  fmContent: '',
              }
            : {}),
    })),
    on(JsConsoleActions.toggleEditorTheme, (state: JsConsoleState) => ({
        ...state,
        editorOptions: { ...state.editorOptions, theme: state.editorOptions.theme === 'vs' ? 'vs-dark' : 'vs' },
    }))
);

export const jsConsoleReducer = (state: JsConsoleState | undefined, action: Action) => reducer(state, action);
