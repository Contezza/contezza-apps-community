import { Injectable } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';

import { IJsConsoleService } from '@contezza/js-console/shared';

import { alfrescoAutocomplete, alfrescoSnippets } from '../utils/alfresco.autocomplete';

import { ConsoleScript, OpenSaveScriptDialogPayload, SaveScriptPayload } from '../interfaces/js-console';
import { JsConsoleScriptSaveDialogService } from '../dialogs/script-save/script-save-dialog.service';
import { catchError, filter, map, switchMap } from 'rxjs/operators';
import { WebscriptService } from '@contezza/core/services';
import { TernModel, TernToTs } from '../utils/tern-to-ts';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class LegacyService implements IJsConsoleService {
    private readonly SAVE_SCRIPT_URL = 'de/fme/jsconsole/savescript.json';
    private readonly API_COMMANDS_URL = 'de/fme/jsconsole/apicommands';
    static readonly URL_TYPING = './assets/js-console/defs/alfresco.json';

    constructor(private readonly saveDialogService: JsConsoleScriptSaveDialogService, private readonly webscript: WebscriptService, private readonly http: HttpClient) {}
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
                        fmScript: payload.fmContent,
                        jsScript: payload.jsContent,
                        putRequest: `${this.SAVE_SCRIPT_URL}?name=${dialogResult.name}&isUpdate=false`,
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
            fmScript: payload.fmContent,
            jsScript: payload.jsContent,
            putRequest: `${this.SAVE_SCRIPT_URL}?name=${payload.selectedScript.text}&isUpdate=true`,
        });
    }

    saveScript(payload: SaveScriptPayload): Observable<{ scripts: Array<ConsoleScript> }> {
        const { fmScript, jsScript, putRequest } = payload;

        return this.webscript
            .put(putRequest, {
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

    getConfig() {
        return {
            baseUrl: './assets',
            defaultOptions: { scrollBeyondLastLine: false, minimap: { enabled: false }, contextmenu: false },
            onMonacoLoad: this.onMonacoLoad.bind(this),
        };
    }

    private get alfrescoNamespace(): Observable<string> {
        return this.http.get<TernModel>(LegacyService.URL_TYPING).pipe(map((json) => TernToTs.adapt(json)));
    }

    onMonacoLoad() {
        forkJoin([this.webscript.get<any>(this.API_COMMANDS_URL), this.alfrescoNamespace]).subscribe(([commands, typing]) => {
            (window as any).monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
                validate: true,
                enableSchemaRequest: true,
                schemas: [],
            });

            (window as any).monaco.languages.registerCompletionItemProvider('javascript', {
                triggerCharacters: ['.'],
                provideCompletionItems(model, position) {
                    const textUntilPosition = model.getValueInRange({
                        startLineNumber: position.lineNumber,
                        startColumn: 1,
                        endLineNumber: position.lineNumber,
                        endColumn: position.column,
                    });

                    // @ts-ignore
                    return {
                        suggestions: alfrescoAutocomplete((window as any).monaco, textUntilPosition, commands.methods) ?? [],
                    };
                },
            });

            (window as any).monaco.languages.registerCompletionItemProvider('javascript', {
                triggerCharacters: ['(', ',', ' '],
                provideCompletionItems: () => ({
                    suggestions: alfrescoSnippets((window as any).monaco, commands),
                }),
            });

            (window as any).monaco.languages.typescript.javascriptDefaults.setCompilerOptions({ lib: ['es5'], allowNonTsExtensions: true });
            (window as any).monaco.languages.typescript.javascriptDefaults.addExtraLib(typing, '*');
        });
    }
}
