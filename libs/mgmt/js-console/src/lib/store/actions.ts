import { createAction, props } from '@ngrx/store';

import { ConsoleScript, ExecuteConsoleResponse, ScriptExecutionTime, SelectedNode, SelectScriptPayloadNode } from '../interfaces/js-console';

export enum JsConsoleActionTypes {
    ExecuteScript = '[JS CONSOLE] EXECUTE_SCRIPT',
    SetExecuteScriptLoading = '[JS CONSOLE] SET_EXECUTE_SCRIPT_LOADING',
    SetScriptExecutionTime = '[JS CONSOLE] SET_SCRIPT_EXECUTION_TIME',
    LoadSelectedNodeContent = '[JS CONSOLE] LOAD_SELECTED_NODE_CONTENT',
    LoadScriptsList = '[JS CONSOLE] LOAD_SCRIPTS_LIST',
    LoadScriptsListSuccess = '[JS CONSOLE] LOAD_SCRIPTS_SUCCESS',
    SetSelectedScript = '[JS CONSOLE] SET_SELECTED_SCRIPT',
    SaveScript = '[JS CONSOLE] SAVE_SCRIPT',
    DeleteScript = '[JS CONSOLE] DELETE_SCRIPT',
    DuplicateScript = '[JS CONSOLE] DUPLICATE_SCRIPT',
    SetJsConsoleContent = '[JS CONSOLE] SET_JS_CONSOLE_CONTENT',
    SetJsConsoleSelectedContent = '[JS CONSOLE] SET_JS_CONSOLE_SELECTED_CONTENT',
    SetFmConsoleContent = '[JS CONSOLE] SET_FM_CONSOLE_CONTENT',
    SetConsoleOutput = '[JS CONSOLE] SET_CONSOLE_OUTPUT',
    SelectScriptPayload = '[JS CONSOLE] SELECT_SCRIPT_PAYLOAD_NODE',
    SetSelectedSpaceNode = '[JS CONSOLE] SET_SELECTED_SPACE_NODE',
    SetRunas = '[JS CONSOLE] SET_RUNAS',
    SetTransaction = '[JS CONSOLE] SET_TRANSACTION',
    SetUrlargs = '[JS CONSOLE] SET_URLARGS',
    ToggleEditorTheme = '[JS CONSOLE] TOGGLE_EDITOR_THEME',
    OpenInJavascriptConsole = '[JS CONSOLE] OPEN_IN_JAVASCRIPT_CONSOLE',
}

export const executeScript = createAction(JsConsoleActionTypes.ExecuteScript);
export const setExecuteScriptLoading = createAction(JsConsoleActionTypes.SetExecuteScriptLoading, props<{ executeScriptLoading: boolean }>());
export const setScriptExecutionTime = createAction(JsConsoleActionTypes.SetScriptExecutionTime, props<{ executionTime: ScriptExecutionTime }>());
export const loadSelectedNodeContent = createAction(JsConsoleActionTypes.LoadSelectedNodeContent, props<{ script: ConsoleScript }>());
export const loadScriptsList = createAction(JsConsoleActionTypes.LoadScriptsList, props<{ selectScript: ConsoleScript | undefined }>());
export const loadScriptsListSuccess = createAction(JsConsoleActionTypes.LoadScriptsListSuccess, props<{ scriptsList: Array<ConsoleScript> }>());
export const setSelectedScript = createAction(JsConsoleActionTypes.SetSelectedScript, props<{ selectedScript: ConsoleScript }>());
export const saveScript = createAction(JsConsoleActionTypes.SaveScript);
export const deleteScript = createAction(JsConsoleActionTypes.DeleteScript, props<{ payload: any }>()); // MinimalNodeEntity[]
export const duplicateScript = createAction(JsConsoleActionTypes.DuplicateScript, props<{ script: ConsoleScript; scripts: Array<ConsoleScript> }>());
export const setJsConsoleContent = createAction(JsConsoleActionTypes.SetJsConsoleContent, props<{ jsContent: string | ArrayBuffer }>());
export const setJsConsoleSelectedContent = createAction(JsConsoleActionTypes.SetJsConsoleSelectedContent, props<{ jsSelectedContent: string }>());
export const setFmConsoleContent = createAction(JsConsoleActionTypes.SetFmConsoleContent, props<{ fmContent: string | ArrayBuffer }>());
export const setConsoleOutput = createAction(JsConsoleActionTypes.SetConsoleOutput, props<{ output: ExecuteConsoleResponse }>());
export const selectScriptPayloadNode = createAction(JsConsoleActionTypes.SelectScriptPayload, props<{ payload: SelectScriptPayloadNode }>());
export const setSelectedSpaceNode = createAction(JsConsoleActionTypes.SetSelectedSpaceNode, props<{ selectedSpaceNode: SelectedNode }>());
export const setRunas = createAction(JsConsoleActionTypes.SetRunas, props<{ runas: string }>());
export const setTransaction = createAction(JsConsoleActionTypes.SetTransaction, props<{ transaction: string }>());
export const setUrlargs = createAction(JsConsoleActionTypes.SetUrlargs, props<{ urlargs: string }>());
export const toggleEditorTheme = createAction(JsConsoleActionTypes.ToggleEditorTheme);
export const openInJavascriptConsole = createAction(JsConsoleActionTypes.OpenInJavascriptConsole);
