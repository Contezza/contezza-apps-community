import { Injectable } from '@angular/core';

import { Store } from '@ngrx/store';

import { BehaviorSubject, catchError, delay, map, Observable, of, Subject, switchMap, take, takeUntil } from 'rxjs';

import { NodesApiService } from '@alfresco/adf-content-services';

import { WebscriptService } from '@contezza/core/services';
import { ContezzaObservables, StringUtils } from '@contezza/core/utils';

import { setScriptExecutionTime } from '../store/actions';
import { ConsoleScript, ExecuteConsolePayload, ExecuteConsoleResponse } from '../interfaces/js-console';

const { concat, toEndpointTemplate } = StringUtils;

@Injectable({
    providedIn: 'root',
})
export class JsConsoleService {
    static readonly ENDPOINT = 'de/fme/jsconsole';
    static readonly ENDPOINT_EXECUTE = concat(JsConsoleService.ENDPOINT, '/execute');
    static readonly ENDPOINT_LISTSCRIPTS = concat(JsConsoleService.ENDPOINT, '/listscripts');
    static readonly ENDPOINT_EXECUTION_RESULT = concat(JsConsoleService.ENDPOINT, '/{resultChannel}/executionResult');
    static readonly TEMPLATE_ENDPOINT_EXECUTION_RESULT = toEndpointTemplate(JsConsoleService.ENDPOINT_EXECUTION_RESULT);

    constructor(private readonly webscript: WebscriptService, private readonly nodesApiService: NodesApiService, private readonly store: Store<unknown>) {}
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
                    switchMap(() => this.webscript.get(JsConsoleService.TEMPLATE_ENDPOINT_EXECUTION_RESULT({ resultChannel: payload.resultChannel })))
                ),
            (val: ExecuteConsoleResponse) => results$.next(val)
        )
            .pipe(takeUntil(stop$))
            .subscribe();
        // final output: when ready emit, complete, and stop requests for partial output
        this.webscript
            .post(JsConsoleService.ENDPOINT_EXECUTE, payload)
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
        return this.webscript.get(JsConsoleService.ENDPOINT_LISTSCRIPTS).pipe(map((list: { scripts }) => list.scripts));
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
