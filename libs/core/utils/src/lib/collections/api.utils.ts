import { Provider, Type } from '@angular/core';

import { WebscriptService } from '@contezza/core/services';

import { BaseApi } from '../classes';

export class ApiUtils {
    /**
     * Provides the given api as `Injectable` service. The api uses `WebscriptService` as `HttpClient`.
     *
     * @param Api
     */
    static readonly provideApiService = <T extends BaseApi>(Api: Type<T>): Provider => ({
        provide: Api,
        useFactory: (webscript: WebscriptService) => new Api(webscript),
        deps: [WebscriptService],
    });
}
