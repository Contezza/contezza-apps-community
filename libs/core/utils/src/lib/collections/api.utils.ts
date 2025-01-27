import { Provider, Type } from '@angular/core';

import { BaseApi } from '../classes';
import { HttpClient } from '../interfaces';
import { Join, QueryParameters } from '../types';
import { OrArray } from './array-utils.class';
import { StringUtils } from './string.utils';

export class ApiUtils {
    /**
     * Similar to `StringUtils.concat` but specific for url path concatenation.
     *
     * @param strings
     */
    static concatPath<T extends string[]>(...strings: T): Join<T, '/'> {
        return strings.join('/') as Join<T, '/'>;
    }

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

    /**
     * Transforms the given object into a query-parameter string.
     *
     * @param queryParameters
     */
    static queryParametersToString(queryParameters: Record<string, OrArray<string | number | boolean>>) {
        const queryParametersAsString: string = Object.entries(queryParameters)
            .filter(([, value]) => value !== null && value !== undefined)
            .map(([key, value]) => `${key}=${value}`)
            .join('&');
        return queryParametersAsString ? '?' + queryParametersAsString : '';
    }

    /**
     * Transforms the given query-parameter string into an object.
     *
     * @param string
     */
    static stringToQueryParameters<T extends string>(string: T): QueryParameters<T> {
        const formatQueryParameter = (qp: string) => {
            const formatElementary = (x: string): string | number => {
                const n = Number(x);
                return Number.isNaN(n) ? x : n;
            };
            return qp.includes(',') ? qp.split(',').map(formatElementary) : formatElementary(qp);
        };
        const queryParameters: Record<string, OrArray<string | number>> = {};
        (string.startsWith('?') ? string.slice(1) : string)
            .split('&')
            .filter((value) => value.includes('='))
            .forEach((queryParam) => {
                const [key, value] = queryParam.split('=');
                queryParameters[key] = formatQueryParameter(value);
            });
        return queryParameters as QueryParameters<T>;
    }

    /**
     * Applies `StringUtils.toTemplate` with specific settings for endpoint templates: placeholders use curly brackets as delimiter, all parameters are required and `string` valued.
     *
     * @param string
     */
    static toEndpointTemplate<T extends string>(string: T) {
        return StringUtils.toTemplate(string, { placeholder: '{...}', requireAllParams: true, acceptOnlyString: true });
    }
}
