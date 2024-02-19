import { Observable } from 'rxjs';

import { Property } from '@alfresco/js-api';

import { BaseApi, ContezzaQueryParameters } from '@contezza/core/utils';

/**
 * JS-api for Alfresco properties.
 */
export class PropertyApi extends BaseApi {
    static readonly ENDPOINT = 'api/properties';

    get(queryParameters: { name?: string; nsp?: string; n?: string; type?: string } = {}): Observable<Property[]> {
        return this.http.get(PropertyApi.ENDPOINT + new ContezzaQueryParameters(queryParameters).toString());
    }
}
