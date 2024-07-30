import { Injectable } from '@angular/core';

import { Store } from '@ngrx/store';

import { BehaviorSubject, catchError, delay, map, Observable, of, Subject, switchMap, take, takeUntil } from 'rxjs';

import { NodesApiService } from '@alfresco/adf-content-services';

import { WebscriptService } from '@contezza/core/services';
import { ContezzaObservables, StringUtils } from '@contezza/core/utils';

import { setScriptExecutionTime } from '../store/actions';
import { ConsoleScript, ExecuteConsolePayload, ExecuteConsoleResponse } from '../interfaces/js-console';
import { NewJsConsoleService } from './js-console.service';

const { concat, toEndpointTemplate } = StringUtils;

@Injectable({
    providedIn: 'root',
})
export class JsConsoleService {
    endpoint = '';
    endpointExecute = '';
    endpointListscripts = '';
    endpointExecutionResult = '';
    templateEndpointExecutionResult = toEndpointTemplate(this.endpointExecutionResult);

    constructor(
        private readonly webscript: WebscriptService,
        private readonly nodesApiService: NodesApiService,
        private readonly store: Store<unknown>,
        private readonly jsService: NewJsConsoleService
    ) {
        this.endpoint = this.jsService.endpoint(); // Deze zou het moeten zijn, maar die heb ik eruit gehaald voor die foutmelding
        //this.endpoint = 'ootbee/jsconsole'; // -> Deze is dus nu alleen voor het testen
        this.endpointExecute = concat(this.endpoint, '/execute');
        this.endpointListscripts = concat(this.endpoint, '/listscripts');
        this.endpointExecutionResult = concat(this.endpoint, '/{resultChannel}/executionResult');
        // this.templateEndpointExecutionResult = toEndpointTemplate(this.endpointExecutionResult);
    }

    executeScript(payload: ExecuteConsolePayload): Observable<ExecuteConsoleResponse> {
        const startTime = new Date();
        // set parameter resultChannel in the request, use it get partial results
        payload.resultChannel = '' + startTime.getTime();
        const stop$ = new Subject<void>();
        // output is emitted using this observable
        const results$ = new Subject<ExecuteConsoleResponse>();
        // partial outputs: request and emit every 1s, stop when final output is ready
        ContezzaObservables.while(
            () => true,
            () =>
                of(void 0).pipe(
                    delay(1000),
                    switchMap(() => this.webscript.get(this.templateEndpointExecutionResult({ resultChannel: payload.resultChannel })))
                ),
            (val: ExecuteConsoleResponse) => results$.next(val)
        )
            .pipe(takeUntil(stop$))
            .subscribe();
        // final output: when ready emit, complete, and stop requests for partial output
        this.webscript
            .post(this.endpointExecute, payload)
            .pipe(
                map((response: ExecuteConsoleResponse) => {
                    stop$.next();
                    stop$.complete();
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
                    stop$.next();
                    stop$.complete();
                    return of({
                        error: {
                            statusCode: errorBody.status.code,
                            statusText: errorBody.status.name,
                            callstack: errorBody.callstack,
                            message: errorBody.message,
                        },
                    });
                })
            )
            .subscribe((response) => {
                results$.next(response);
                results$.complete();
            });
        return results$;
    }

    getScriptsList(): Observable<Array<ConsoleScript>> {
        return this.webscript.get(this.endpointListscripts).pipe(map((list: { scripts }) => list.scripts));
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
