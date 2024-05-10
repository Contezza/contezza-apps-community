import { Provider, Type } from '@angular/core';

import { BaseApi } from '../classes';
import { HttpClient } from '../interfaces';

export class ApiUtils {
    /**
     * Provides the given api as `Injectable` service.
     *
     * @param Api
     * @param Http
     */
    static readonly provideApiService = <TApi extends BaseApi, THttpClient extends HttpClient>(Api: Type<TApi>, Http: Type<THttpClient>): Provider => ({
        provide: Api,
        useFactory: (http: typeof Http) => new Api(http),
        deps: [Http],
    });
}
