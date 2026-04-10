import { inject, Injectable, InjectionToken, Type } from '@angular/core';

import { Observable, OperatorFunction, switchMap } from 'rxjs';
import * as rxjs from 'rxjs/operators';

import { ArrayUtils, ContezzaUtils, NgUtils } from '@contezza/core/utils';

const MAPS = new InjectionToken<Record<string, any>[]>('MAPS');
export const provideMaps = NgUtils.createFactoryRecordProvider(MAPS);

export type Operator = OperatorFunction<any, any> | ((...args: any[]) => OperatorFunction<any, any>);

const OPERATORS = new InjectionToken<Record<string, Operator>[]>('OPERATORS');
export const provideElementaryOperators = (operators: Record<string, Operator>) => ({
    provide: OPERATORS,
    useValue: operators,
    multi: true,
});
export const provideOperators = NgUtils.createFactoryRecordProvider(OPERATORS);
export const provideServiceOperators = (operators: Record<string, Type<any>>) => {
    const getFn = (service: object, fnName: string, error = `Function ${fnName} not found`): ((...args: any) => Observable<any>) => {
        const fn = service[fnName];
        if (!fn || typeof fn !== 'function') {
            throw new Error(error);
        }
        return fn.bind(service);
    };

    return provideOperators(
        Object.fromEntries(
            Object.entries(operators).map(([key, serviceType]) => [
                key,
                (service = inject(serviceType)) =>
                    (method: string) =>
                        switchMap((args: any) => getFn(service, method, `Function ${method} not found in service ${key}`)(...ArrayUtils.asArray(args))),
            ]),
        ),
    );
};

const SOURCE_TYPES = new InjectionToken<Record<string, (value: string, options?: any) => Observable<any>>[]>('SOURCE_TYPES');
export const provideSourceTypes = NgUtils.createFactoryRecordProvider(SOURCE_TYPES);

@Injectable({
    providedIn: 'root',
})
export class ContezzaIdResolverService {
    // constructor
    private readonly providedMaps = inject(MAPS, { optional: true });
    private readonly providedOperators = inject(OPERATORS, { optional: true });
    private readonly providedSourceTypes = inject(SOURCE_TYPES, { optional: true });

    constructor() {
        this.providedMaps?.forEach(list => this.set(list, 'map'));
        this.providedOperators?.forEach(list => this.set(list, 'operator'));
        this.providedSourceTypes?.forEach(list => this.set(list, 'sourceType'));

        this.set(
            {
                'dynamic-source': (filters: ContezzaIdResolverSource[]) => {
                    const resolvedFilters = filters.map(flt => this.resolve(flt, 'operator'));
                    return $ => $.pipe(...resolvedFilters);
                },
            },
            'map',
        );
    }

    private readonly registry: Record<string, Record<string, any>> = {};

    set<T>(values: Record<string, T>, type: string) {
        if (values) {
            if (!this.registry[type]) {
                this.registry[type] = {};
            }
            Object.assign(this.registry[type], values);
        }
    }

    resolve<T = any>(source: ContezzaIdResolverSource, type?: string, defaultValue?: T): T {
        let id: string;
        let parameters: any;
        if (typeof source === 'string') {
            id = source;
        } else {
            id = source.id;
            parameters = source.parameters;
        }
        let resolved = (type ? this.registry[type] : Object.values(this.registry).reduce((acc, val) => Object.assign(acc, val), {}))?.[id];
        if (!resolved && type === 'operator') {
            // if the source cannot be resolved and it is of type operator, then try to resolve it from rxjs/operators
            resolved = rxjs[id];
        }
        if (resolved) {
            // try to use parameters as callback
            return parameters !== undefined ? resolved((typeof parameters === 'string' && ContezzaUtils.stringToFunction(parameters)) || parameters) : resolved;
        } else {
            console.warn('Cannot resolve source ' + id + (type && ' of type ' + type));
            return defaultValue;
        }
    }
}

export interface ContezzaBaseSource {
    readonly id: string;
    readonly parameters?: any;
}

export type ContezzaIdResolverSource<T extends ContezzaBaseSource = ContezzaBaseSource> = string | T;
