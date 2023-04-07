import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { WebscriptApi } from '@alfresco/js-api';
import { AlfrescoApiService } from '@alfresco/adf-core';

import { ContezzaObservables, HttpClient, HttpMethod } from '@contezza/core/utils';

/**
 * Facilitates Alfresco `WebscriptApi`.
 */
@Injectable({ providedIn: 'root' })
export class WebscriptService implements HttpClient {
    private _webscriptApi: WebscriptApi;
    private get webscript(): WebscriptApi {
        if (!this._webscriptApi) {
            this._webscriptApi = new WebscriptApi(this.apiService.getInstance());
        }
        return this._webscriptApi;
    }

    constructor(private readonly apiService: AlfrescoApiService) {}

    get<T>(url: string): Observable<T> {
        return this.execute(HttpMethod.Get, url);
    }

    post<T>(url: string, body: any): Observable<T> {
        return this.execute(HttpMethod.Post, url, body);
    }

    put<T>(url: string, body: any): Observable<T> {
        return this.execute(HttpMethod.Put, url, body);
    }

    delete<T>(url: string): Observable<T> {
        return this.execute(HttpMethod.Delete, url);
    }

    execute<T>(httpMethod: HttpMethod.Get | HttpMethod.Delete, url: string): Observable<T>;
    execute<T>(httpMethod: HttpMethod.Post | HttpMethod.Put, url: string, body: any): Observable<T>;
    execute<T>(httpMethod: HttpMethod, url: string, body?: any): Observable<T> {
        return ContezzaObservables.from(this.webscript.executeWebScript(httpMethod.toString().toUpperCase(), url, '', '', '', body));
    }
}
