import { Injectable } from '@angular/core';
import { ConsoleScript, OpenSaveScriptDialogPayload, SaveScriptPayload } from '../interfaces/js-console';

import { IJsConsoleService } from '@contezza/js-console/shared';
import { catchError, Observable, of } from 'rxjs';
import { JsConsoleScriptSaveDialogService } from '../dialogs/script-save/script-save-dialog.service';
import { filter, map, switchMap } from 'rxjs/operators';
import { WebscriptService } from '@contezza/core/services';
import { TernModel, TernToTs } from '../utils/tern-to-ts';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class OotbService implements IJsConsoleService {
    private readonly SAVE_SCRIPT_URL = 'ootbee/jsconsole/savescript.json';
    static readonly URL_TYPING = './assets/js-console/defs/alfresco.json';

    constructor(private readonly saveDialogService: JsConsoleScriptSaveDialogService, private readonly webscript: WebscriptService, private readonly http: HttpClient) {}
    check() {
        return 'ootb';
    }

    endpoint() {
        return 'ootbee/jsconsole';
    }

    apiCommandsUrl() {
        return 'ootbee/jsconsole/apicommands';
    }

    saveScriptUrl() {
        return 'ootbee/jsconsole/savescript.json';
    }

    // saveNew stuurt payload en request path mee die nodig zijn voor nieuw script (dus de namePath die wordt meegenomen vanuit een dialog)
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
                        putRequest: `${this.SAVE_SCRIPT_URL}?namePath=${dialogResult.name}`,
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

    // saveExisted stuurt payload en request path mee die nodig zijn voor al bestaand script (dus de nodeRef van bestaande script, die wordt meegenomen vanuit de payload - value)
    saveExisted(payload: OpenSaveScriptDialogPayload): Observable<any> {
        return this.saveScript({
            fmScript: payload.fmContent,
            jsScript: payload.jsContent,
            putRequest: `${this.SAVE_SCRIPT_URL}?nodeRef=${payload.selectedScript.value}`,
        });
    }

    private saveScript(payload: SaveScriptPayload): Observable<{ scripts: Array<ConsoleScript> }> {
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
        return this.http.get<TernModel>(OotbService.URL_TYPING).pipe(map((json) => TernToTs.adapt(json)));
    }

    onMonacoLoad() {
        this.alfrescoNamespace.subscribe((typing) => {
            (window as any).monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
                validate: true,
                enableSchemaRequest: true,
                schemas: [],
            });

            (window as any).monaco.languages.typescript.javascriptDefaults.setCompilerOptions({ lib: ['es5'], allowNonTsExtensions: true });
            (window as any).monaco.languages.typescript.javascriptDefaults.addExtraLib(typing, '*');
        });
    }
}
