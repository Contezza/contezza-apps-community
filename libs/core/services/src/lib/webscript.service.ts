import { inject, Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { AlfrescoApiService } from '@alfresco/adf-content-services';

import { ContezzaObservables, HttpClient, HttpMethod } from '@contezza/core/utils';

/**
 * Facilitates Alfresco `WebscriptApi` while allowing PATCH HTTP method.
 */
@Injectable({ providedIn: 'root' })
export class WebscriptService implements HttpClient {
    // constructor
    private readonly apiService = inject(AlfrescoApiService);

    get<T>(url: string): Observable<T> {
        return this.execute(HttpMethod.GET, url);
    }

    post<T>(url: string, body: any): Observable<T> {
        return this.execute(HttpMethod.POST, url, body);
    }

    put<T>(url: string, body: any): Observable<T> {
        return this.execute(HttpMethod.PUT, url, body);
    }

    delete<T>(url: string): Observable<T> {
        return this.execute(HttpMethod.DELETE, url);
    }

    patch<T>(url: string, body: any): Observable<T> {
        return this.execute(HttpMethod.PATCH, url, body);
    }

    execute<T>(httpMethod: HttpMethod.GET | HttpMethod.DELETE, url: string): Observable<T>;
    execute<T>(httpMethod: HttpMethod.POST | HttpMethod.PUT | HttpMethod.PATCH, url: string, body: any): Observable<T>;
    execute<T>(httpMethod: HttpMethod, url: string, body?: any): Observable<T> {
        return ContezzaObservables.from(() =>
            this.apiService
                .getInstance()
                .contentClient.callApi(
                    '/service/' + url,
                    httpMethod,
                    {},
                    '',
                    {},
                    {},
                    body,
                    body ? ['application/json'] : ['multipart/form-data'],
                    ['application/json', 'text/html'],
                    null,
                    'alfresco',
                ),
        );
    }
}
