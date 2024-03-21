import { Provider, Type } from '@angular/core';

import { BaseApi } from '@contezza/core/utils';

import { WebscriptService } from './webscript.service';

/**
 * Provides the given api as `Injectable` service. The api uses `WebscriptService` as `HttpClient`.
 *
 * @param Api
 */
export const provideApiService = <T extends BaseApi>(Api: Type<T>): Provider => ({
    provide: Api,
    useFactory: (webscript: WebscriptService) => new Api(webscript),
    deps: [WebscriptService],
});
