import { Injectable } from '@angular/core';

import { Store } from '@ngrx/store';

import {BehaviorSubject, delay, Observable, of, Subject} from 'rxjs';
import {catchError, map, switchMap, take, takeUntil} from 'rxjs/operators';

import { NodesApiService } from '@alfresco/adf-content-services';

import { WebscriptService } from '@contezza/core/services';

import { setScriptExecutionTime } from '../store/actions';
import { ConsoleScript, ExecuteConsolePayload, ExecuteConsoleResponse } from '../interfaces/js-console';
import {ContezzaObservables} from "@contezza/core/utils";

@Injectable({
    providedIn: 'root',
})
export class JsConsoleService {
    private readonly EXECUTE_URL = 'de/fme/jsconsole/execute';
    private readonly LIST_SCRIPTS_URL = 'de/fme/jsconsole/listscripts';
    private readonly EXECUTION_RESULT_URL = 'de/fme/jsconsole/${resultChannel}/executionResult'
    results = new Subject<string[]>()

    constructor(private readonly webscript: WebscriptService, private readonly nodesApiService: NodesApiService, private readonly store: Store<unknown>) {}
    executeScript(payload: ExecuteConsolePayload): Observable<ExecuteConsoleResponse> {
        const startTime = new Date();
        console.log(startTime.getTime())
        // console.log(payload)
        payload.resultChannel = "" + startTime.getTime()
        const stop$ = new Subject<void>()
        console.log(this.results)
// results meegeven als de output tot de sript klaar is???
        this.results.subscribe((val) => console.log(val))
        ContezzaObservables.while(() => true, () => of(void 0).pipe(
            delay(2000),
            switchMap(() => this.webscript.get(
                this.EXECUTION_RESULT_URL.replace('${resultChannel}', payload.resultChannel)))),
            (val: ExecuteConsoleResponse) => this.results.next(val.printOutput))
            .pipe(
                takeUntil(stop$))
                .subscribe()
        return this.webscript.post(this.EXECUTE_URL, payload).pipe(
            map((response: ExecuteConsoleResponse) => {
                stop$.next()
                stop$.complete()
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
                stop$.next()
                stop$.complete()
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
