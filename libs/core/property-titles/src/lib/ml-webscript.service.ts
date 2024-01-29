import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { AlfrescoApi } from '@alfresco/js-api';

import { WebscriptService } from '@contezza/core/services';
import { ContezzaObservables, HttpMethod } from '@contezza/core/utils';

/**
 * Extension of `WebscriptService` which overrides `Accept-Language` header.
 */
@Injectable({ providedIn: 'root' })
export class MlWebscriptService extends WebscriptService {
    private _language?: string;

    set language(language: string) {
        this._language = language;
    }

    execute<T>(httpMethod: HttpMethod, url: string, body?: any): Observable<T> {
        return ContezzaObservables.from(() =>
            ((this as any).apiService.getInstance() as AlfrescoApi).contentClient.callApi(
                '/service/' + url,
                httpMethod.toUpperCase(),
                {},
                undefined,
                { 'Accept-Language': this._language },
                {},
                body,
                ['application/json'],
                ['application/json', 'text/html'],
                null,
                'alfresco'
            )
        );
    }
}
