import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';
import { catchError, filter, map, switchMap } from 'rxjs/operators';

import { WebscriptService } from '@contezza/common';

import { JsConsoleScriptSaveDialogService } from '../dialogs/script-save/script-save-dialog.service';
import { ConsoleScript, OpenSaveScriptDialogPayload, SaveScriptPayload } from '../interfaces/js-console';

@Injectable({
    providedIn: 'root',
})
export class JsConsoleSaveScriptService {
    private readonly SAVE_SCRIPT_URL = 'de/fme/jsconsole/savescript.json';

    constructor(private readonly webscript: WebscriptService, private readonly saveDialogService: JsConsoleScriptSaveDialogService) {}

    saveNew(payload: OpenSaveScriptDialogPayload, isUpdate = false, data = {}): Observable<{ scripts: Array<ConsoleScript>; created?: ConsoleScript }> {
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
                        isUpdate,
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

    private saveScript(payload: SaveScriptPayload): Observable<{ scripts: Array<ConsoleScript> }> {
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
            );
    }
}
