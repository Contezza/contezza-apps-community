import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { WebscriptApi } from '@alfresco/js-api';
import { AlfrescoApiService } from '@alfresco/adf-core';

import { ContezzaObservables, HttpClient } from '@contezza/core/utils';

enum HttpMethodType {
    Get = 'get',
    Post = 'post',
    Put = 'put',
    Delete = 'delete',
}

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
        return this.execute(HttpMethodType.Get, url);
    }

    post<T>(url: string, body: any): Observable<T> {
        return this.execute(HttpMethodType.Post, url, body);
    }

    put<T>(url: string, body: any): Observable<T> {
        return this.execute(HttpMethodType.Put, url, body);
    }

    delete<T>(url: string): Observable<T> {
        return this.execute(HttpMethodType.Delete, url);
    }

    execute<T>(httpMethod: HttpMethodType.Get | HttpMethodType.Delete, url: string): Observable<T>;
    execute<T>(httpMethod: HttpMethodType.Post | HttpMethodType.Put, url: string, body?: any): Observable<T>;
    execute<T>(httpMethod: HttpMethodType, url: string, body?: any): Observable<T> {
        return ContezzaObservables.from(this.webscript.executeWebScript(httpMethod.toString().toUpperCase(), url, '', '', '', body));
    }
}
