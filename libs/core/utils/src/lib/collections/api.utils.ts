import { Provider, Type } from '@angular/core';

import { BaseApi } from '../classes';
import { HttpClient } from '../interfaces';
import { Join, QueryParameters } from '../types';
import { ArrayUtils, OrArray } from './array-utils.class';
import { StringUtils } from './string.utils';

type ArrayFormat = 'comma' | 'repeat';
interface QueryParametersToStringOptions {
    /**
     * How an array value must be formatted. Possible values are:
     * `comma` - values are comma separated in a single query parameter, e.g. `{ type: ['a', 'b'] }` becomes `type=a,b`
     * `repeat` - each value generates a new query parameter, e.g. `{ type: ['a', 'b'] }` becomes `type=a&type=b`
     */
    arrayFormat?: ArrayFormat;
}

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
     * @param queryParameters An object representing query parameters.
     * @param options Formatting options.
     */
    static queryParametersToString<T extends { [K in keyof T]: OrArray<string | number | boolean> }>(queryParameters: T, options?: QueryParametersToStringOptions): string {
        const queryParametersAsString: string = Object.entries(queryParameters)
            .filter(([, value]) => value !== null && value !== undefined)
            .map(([key, value]) => {
                if (Array.isArray(value)) {
                    // if the value is an array, then apply different logic based on options?.arrayFormat
                    switch (options?.arrayFormat) {
                        case 'repeat':
                            // each value generates a new query parameter, e.g. `{ type: ['a', 'b'] }` becomes `type=a&type=b`
                            return value.map(v => `${key}=${v}`).join('&');
                        case 'comma':
                        default:
                            // values are comma separated in a single query parameter, e.g. `{ type: ['a', 'b'] }` becomes `type=a,b`
                            return `${key}=${value}`;
                    }
                } else {
                    return `${key}=${value}`;
                }
            })
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
            .filter(value => value.includes('='))
            .forEach(queryParam => {
                const [key, value] = queryParam.split('=');
                const formattedValue = formatQueryParameter(value);
                queryParameters[key] =
                    key in queryParameters
                        ? // if queryParameters already has the key, then the value must become an array and be concatenated with the new value
                          ArrayUtils.asArray(queryParameters[key]).concat(ArrayUtils.asArray(formattedValue))
                        : // otherwise simply set the new value
                          formattedValue;
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
