import { Injectable } from '@angular/core';

import { AlfrescoApiService } from '@alfresco/adf-core';

import { ContezzaCommonService } from './common.service';
import { WebscriptApi } from '@alfresco/js-api';
import { from, Observable, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

interface WebscriptOptions {
    catchError?: boolean;
    showDefaultErrorMessage?: boolean;
}

@Injectable({
    providedIn: 'root',
})
export class WebscriptService {
    readonly ready$ = this.apiService.alfrescoApiInitialized.asObservable();

    constructor(private readonly commonService: ContezzaCommonService, private readonly apiService: AlfrescoApiService) {}

    private _webscriptApi: WebscriptApi;

    get webscript(): WebscriptApi {
        this._webscriptApi = this._webscriptApi ?? new WebscriptApi(this.apiService.getInstance());
        return this._webscriptApi;
    }

    get<T = any>(url: string, options?: WebscriptOptions): Observable<T> {
        return this.handleResponse(of(null).pipe(switchMap(() => from(this.webscript.executeWebScript('GET', url)))), options);
    }

    post<T = any>(url: string, body: any, options?: WebscriptOptions): Observable<T> {
        return this.handleResponse(of(null).pipe(switchMap(() => from(this.webscript.executeWebScript('POST', url, '', '', '', body)))), options);
    }

    put<T = any>(url: string, body: any, options?: WebscriptOptions): Observable<T> {
        return this.handleResponse(of(null).pipe(switchMap(() => from(this.webscript.executeWebScript('PUT', url, '', '', '', body)))), options);
    }

    delete<T = any>(url: string, options?: WebscriptOptions): Observable<T> {
        return this.handleResponse(of(null).pipe(switchMap(() => from(this.webscript.executeWebScript('DELETE', url)))), options);
    }

    getPromise<T = any>(url: string, options?: WebscriptOptions): Promise<T> {
        return this.webscript.executeWebScript('GET', url).catch((error) => this.commonService.handleError(error, !options?.showDefaultErrorMessage));
    }

    // REPOSITORY POST ACTION
    postAction(actionName: string, actionedUponNodeRef: string, params: any, options?: WebscriptOptions): Observable<any> {
        return this.handleResponse(
            of(null).pipe(
                switchMap(() =>
                    from(
                        this.webscript.executeWebScript('POST', 'action-executions', '', '', 'api/-default-/public/alfresco/versions/1', {
                            actionDefinitionId: actionName,
                            targetId: actionedUponNodeRef,
                            params,
                        })
                    )
                )
            ),
            options
        );
    }

    private handleResponse<T = any>(response: Observable<T>, options?: WebscriptOptions): Observable<T> {
        return options?.catchError
            ? response.pipe(
                  catchError((error) => {
                      this.commonService.handleError(error, !options.showDefaultErrorMessage);
                      return of(null);
                  })
              )
            : response;
    }
}
