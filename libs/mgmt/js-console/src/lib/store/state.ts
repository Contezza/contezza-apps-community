import { RouterReducerState } from '@ngrx/router-store';

import { ContezzaRouterState } from '@contezza/utils';

import { ConsoleEditorOptions, ConsoleScript, ExecuteConsoleResponse, ScriptExecutionTime, SelectedNode } from '../interfaces/js-console';

export interface ContezzaJsConsoleState {
    router: RouterReducerState<ContezzaRouterState>;
    jsConsoleState: JsConsoleState;
}

export interface JsConsoleState {
    jsContent: string | ArrayBuffer;
    jsSelectedContent: string;
    fmContent: string | ArrayBuffer;
    selectedNode: SelectedNode;
    selectedSpaceNode: SelectedNode;
    runas: string;
    transaction: string;
    urlargs: string;
    executeScriptLoading: boolean;
    output: ExecuteConsoleResponse;
    scriptsList: Array<ConsoleScript>;
    selectedScript?: ConsoleScript;
    executionTime: ScriptExecutionTime;
    editorOptions: ConsoleEditorOptions;
}

const defaultEditorOptions = {
    automaticLayout: true,
    quickSuggestions: true,
    wordBasedSuggestions: true,
};

export const initialState: JsConsoleState = {
    jsContent: '',
    jsSelectedContent: '',
    fmContent: '',
    selectedNode: {
        nodeRef: '',
        name: '',
    },
    selectedSpaceNode: {
        nodeRef: '',
        name: '',
    },
    runas: 'admin',
    transaction: 'readwrite',
    urlargs: '',
    executeScriptLoading: false,
    output: undefined,
    scriptsList: [],
    selectedScript: undefined,
    executionTime: undefined,
    editorOptions: {
        theme: 'vs',
        js: { ...defaultEditorOptions, language: 'javascript' },
        fm: { ...defaultEditorOptions, language: 'freemarker2' },
    },
};
