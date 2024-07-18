import { Injectable } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';

import { IJsConsoleService } from '@contezza/js-console/shared';

import { alfrescoAutocomplete, alfrescoSnippets } from '../utils/alfresco.autocomplete';

import { ConsoleScript, OpenSaveScriptDialogPayload, SaveScriptPayload } from '../interfaces/js-console';
import { JsConsoleSaveScriptService } from './save-script.service';
import { JsConsoleScriptSaveDialogService } from '../dialogs/script-save/script-save-dialog.service';
import { catchError, filter, map, switchMap } from 'rxjs/operators';
import { WebscriptService } from '@contezza/core/services';
import { JsConsoleMonacoEditorService } from './monaco-editor.service';

@Injectable({ providedIn: 'root' })
export class LegacyService implements IJsConsoleService {
    private readonly SAVE_SCRIPT_URL = 'de/fme/jsconsole/savescript.json';
    constructor(
        private readonly saveDialogService: JsConsoleScriptSaveDialogService,
        private readonly saveScriptService: JsConsoleSaveScriptService,
        private readonly webscript: WebscriptService,
        private readonly monacoEditor: JsConsoleMonacoEditorService
    ) {}
    check() {
        return 'legacy';
    }

    endpoint() {
        return 'de/fme/jsconsole';
    }

    apiCommandsUrl() {
        return 'de/fme/jsconsole/apicommands';
    }

    saveScriptUrl() {
        return 'de/fme/jsconsole/savescript.json';
    }

    saveNew(payload: OpenSaveScriptDialogPayload, data = {}): Observable<{ scripts: Array<ConsoleScript>; created?: ConsoleScript }> {
        return this.saveDialogService
            .afterClosed({
                width: '30%',
                autoFocus: true,
                panelClass: 'script-save-dialog',
                data,
            })
            .pipe(
                filter((result) => !!result),
                switchMap((dialogResult) =>
                    this.saveScript({
                        name: dialogResult.name,
                        isUpdate: false,
                        fmScript: payload.fmContent,
                        jsScript: payload.jsContent,
                    }).pipe(
                        map((response) => {
                            if (response?.scripts) {
                                const created = response.scripts.find((script) => script.text === dialogResult.name);

                                return {
                                    scripts: response.scripts,
                                    created,
                                };
                            }
                            return undefined;
                        })
                    )
                )
            );
    }

    saveExisted(payload: OpenSaveScriptDialogPayload): Observable<any> {
        return this.saveScript({
            name: payload.selectedScript.text,
            isUpdate: true,
            fmScript: payload.fmContent,
            jsScript: payload.jsContent,
        });
    }

    saveScript(payload: SaveScriptPayload): Observable<{ scripts: Array<ConsoleScript> }> {
        const { name, isUpdate, fmScript, jsScript } = payload;

        return this.webscript
            .put(`${this.SAVE_SCRIPT_URL}?name=${name}&isUpdate=${isUpdate}`, {
                fmScript,
                jsScript,
            })
            .pipe(
                catchError((error) => {
                    const parsedError = JSON.parse(error.message);

                    return of({
                        errorMessage: parsedError.message.split(':').pop(),
                    });
                })
            ) as Observable<{ scripts: Array<ConsoleScript> }>;
    }

    onMonacoLoad() {
        forkJoin([this.webscript.get<any>(this.monacoEditor.API_COMMANDS_URL), this.monacoEditor.alfrescoNamespace]).subscribe(([commands, typing]) => {
            (window as any).monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
                validate: true,
                enableSchemaRequest: true,
                schemas: [],
            });

            (window as any).monaco.languages.registerCompletionItemProvider('javascript', {
                triggerCharacters: ['.'],
                provideCompletionItems: function (model, position) {
                    const textUntilPosition = model.getValueInRange({
                        startLineNumber: position.lineNumber,
                        startColumn: 1,
                        endLineNumber: position.lineNumber,
                        endColumn: position.column,
                    });

                    // @ts-ignore
                    return {
                        suggestions: alfrescoAutocomplete((<any>window).monaco, textUntilPosition, commands.methods) ?? [],
                    };
                },
            });

            (window as any).monaco.languages.registerCompletionItemProvider('javascript', {
                triggerCharacters: ['(', ',', ' '],
                provideCompletionItems: () => ({
                    suggestions: alfrescoSnippets((<any>window).monaco, commands),
                }),
            });

            (window as any).monaco.languages.typescript.javascriptDefaults.setCompilerOptions({ lib: ['es5'], allowNonTsExtensions: true });
            (window as any).monaco.languages.typescript.javascriptDefaults.addExtraLib(typing, '*');
        });
    }

    // TODO: implement interface methods
}
