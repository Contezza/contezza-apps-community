import { Injectable } from '@angular/core';

import { Store } from '@ngrx/store';

import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, take } from 'rxjs/operators';

import { NodesApiService } from '@alfresco/adf-content-services';

import { WebscriptService } from '@contezza/core/services';

import { setScriptExecutionTime } from '../store/actions';
import { ConsoleScript, ExecuteConsolePayload, ExecuteConsoleResponse } from '../interfaces/js-console';

@Injectable({
    providedIn: 'root',
})
export class JsConsoleService {
    private readonly EXECUTE_URL = 'de/fme/jsconsole/execute';
    private readonly LIST_SCRIPTS_URL = 'de/fme/jsconsole/listscripts';

    constructor(private readonly webscript: WebscriptService, private readonly nodesApiService: NodesApiService, private readonly store: Store<unknown>) {}

    executeScript(payload: ExecuteConsolePayload): Observable<ExecuteConsoleResponse> {
        const startTime = new Date();

        return this.webscript.post(this.EXECUTE_URL, payload).pipe(
            map((response: ExecuteConsoleResponse) => {
                this.store.dispatch(
                    setScriptExecutionTime({
                        executionTime: {
                            ms: new Date().getTime() - startTime.getTime(),
                            timestamp: startTime,
                        },
                    })
                );
                return { ...response, error: undefined };
            }),
            catchError((error) => {
                const parsedError = JSON.parse(JSON.stringify(error));
                const errorBody = parsedError.response.body;

                return of({
                    error: {
                        statusCode: errorBody.status.code,
                        statusText: errorBody.status.name,
                        callstack: errorBody.callstack,
                        message: errorBody.message,
                    },
                });
            })
        );
    }

    getScriptsList(): Observable<Array<ConsoleScript>> {
        return this.webscript.get(this.LIST_SCRIPTS_URL).pipe(map((list: { scripts }) => list.scripts));
    }

    getNodeContent(nodeId: string): Observable<string | ArrayBuffer> {
        const contentSource = new BehaviorSubject<string | ArrayBuffer>(null);
        if (nodeId) {
            this.nodesApiService
                .getNodeContent(nodeId)
                .pipe(take(1))
                .subscribe(
                    (content) =>
                        new Promise<void>((resolve, reject) => {
                            const reader = new FileReader();

                            reader.onload = () => {
                                contentSource.next(reader.result);
                                resolve();
                            };

                            reader.onerror = (error: any) => {
                                reject(error);
                            };

                            reader.readAsText(content);
                        })
                );
        }
        return contentSource.asObservable();
    }
}
