import { editor } from 'monaco-editor';
import IEditorConstructionOptions = editor.IEditorConstructionOptions;

export interface ExecuteConsolePayload {
    documentNodeRef: string;
    resultChannel: string;
    runas: string;
    script: string | ArrayBuffer;
    spaceNodeRef: string;
    template: string | ArrayBuffer;
    transaction: string;
    urlargs: string;
}

export interface ExecuteConsoleResponse {
    dumpOutput?: Array<string | ConsoleOutputDump>;
    printOutput?: Array<any>;
    renderedTemplate?: string;
    result?: any;
    scriptOffset?: string;
    scriptPerf?: string;
    spaceNodeRef?: string;
    spacePath?: string;
    webscriptPerf?: string;
    error?: ExecuteConsoleError | undefined;
}

export interface ConsoleOutputDump {
    json: string;
    nodeRef: string;
}

export interface ExecuteConsoleError {
    statusCode: number;
    statusText: string;
    callstack: string;
    message: string;
}

export interface SelectedNode {
    nodeRef: string;
    name: string;
}

export interface ConsoleScript {
    text: string;
    value: string;
}

export interface OpenSaveScriptDialogPayload {
    jsContent: string | ArrayBuffer;
    fmContent: string | ArrayBuffer;
    selectedScript: ConsoleScript | undefined;
}

export interface SaveScriptPayload {
    name: string;
    isUpdate: boolean;
    fmScript: string | ArrayBuffer;
    jsScript: string | ArrayBuffer;
}

export type SelectScriptPayloadNodeType = 'spaceNoderef' | 'document';

export interface SelectScriptPayloadNode {
    type: SelectScriptPayloadNodeType;
    selectNodeTitle: string;
    showFilesInSelect: boolean;
}

export interface ScriptExecutionTime {
    ms: number;
    timestamp: Date;
}

export interface ConsoleEditorOptions {
    theme: string;
    js: JsConsoleEditorConstructionOptions;
    fm: JsConsoleEditorConstructionOptions;
}

export interface JsConsoleEditorConstructionOptions extends IEditorConstructionOptions {
    language?: string;
}
