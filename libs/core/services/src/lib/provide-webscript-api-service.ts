import { Provider, Type } from '@angular/core';

import { ApiUtils, BaseApi } from '@contezza/core/utils';

import { WebscriptService } from './webscript.service';

/**
 * Provides the given api as `Injectable` service. The api uses `WebscriptService` as `HttpClient`.
 *
 * @param Api
 */
export const provideWebscriptApiService = <T extends BaseApi>(Api: Type<T>): Provider => ApiUtils.provideApiService(Api, WebscriptService);
