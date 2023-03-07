import { Injectable } from '@angular/core';

import { Store } from '@ngrx/store';

import { BehaviorSubject, combineLatest, merge, Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

import { ObjectUtils } from '@alfresco/adf-core';

import { ContezzaObjectUtils } from '@contezza/core/utils';

import { ContezzaDependenciesService } from './dependencies.service';
import { ContezzaIdResolverService, ContezzaIdResolverSource } from './id-resolver.service';
import { ContezzaLoadingEvent, ContezzaProcessedSource } from '../classes';
import { ContezzaObservableOperatorsService } from './observable-operators.service';

@Injectable({
    providedIn: 'root',
})
export class ContezzaDynamicSourceProcessorService {
    static readonly DEFAULT_SOURCE_TYPE = 'value';

    static readonly PARAM_SOURCE = 'dynamic-source';

    static isSource(source: any): source is ContezzaDynamicSource {
        // using 'in' syntax to allow source:null-ish
        return source && typeof source === 'object' && ContezzaDynamicSourceProcessorService.PARAM_SOURCE in source;
    }

    static makeElementarySource(source: ContezzaDynamicSource): ContezzaElementarySource {
        return {
            type: source.type || ContezzaDynamicSourceProcessorService.DEFAULT_SOURCE_TYPE,
            source: ContezzaDynamicSourceProcessorService.isSource(source) ? source[ContezzaDynamicSourceProcessorService.PARAM_SOURCE] : source,
            error: source.error,
            filters: source.filters,
            parameters: source.parameters,
        };
    }

    constructor(
        private readonly store: Store<unknown>,
        private readonly dependencies: ContezzaDependenciesService,
        private readonly idResolver: ContezzaIdResolverService,
        private readonly operatorsService: ContezzaObservableOperatorsService
    ) {}

    processSource<T>(source: any): ContezzaProcessedSource<T> {
        // the following cases must be covered:
        // case 1: source is string
        // case 2: source is not a string, but also not a ContezzaDynamicSourceInterface, thus a generic json object
        // this should include arrays, TODO: check for array defaultValue and initialValue
        // case 3: source is a ContezzaDynamicSourceInterface
        const loading = new BehaviorSubject<ContezzaLoadingEvent>(new ContezzaLoadingEvent(true));
        return new ContezzaProcessedSource(merge(this.processNestedSource<T>(source, loading), loading));
    }

    private processElementarySource<T>(source: ContezzaElementarySource, loading?: BehaviorSubject<ContezzaLoadingEvent>): Observable<T> {
        return this.operatorsService
            .resolve(source.filters)
            .reduce(
                (acc, flt) => acc.pipe(flt),
                this.dependencies.processSource(source.source).pipe(
                    tap(() => loading?.next(new ContezzaLoadingEvent(true))),
                    switchMap((processedSource) =>
                        this.idResolver.resolve<(value: string, silent?: boolean) => Observable<any>>(source.type, 'sourceType', (s) => of(s))(processedSource, !!source.error)
                    ),
                    tap(() => loading?.next(new ContezzaLoadingEvent(true))),
                    tap((res) => {
                        if (!res && source.error) {
                            this.store.dispatch({ type: 'SNACKBAR_ERROR', payload: source.error });
                        }
                    })
                )
            )
            .pipe(tap(() => loading?.next(new ContezzaLoadingEvent(false))));
    }

    private processNestedSource<T>(source: any, loading?: BehaviorSubject<ContezzaLoadingEvent>): Observable<T> {
        // source can be anything
        // some (nested) properties of source are source objects
        // step 1: look for (nested) properties that are source objects, store their paths in an array

        // source objects are:
        // (0) null-ish objects
        // (1) non-objects
        // (2) ContezzaDynamicSourceInterface objects checked using isSource() static method
        const foundSources: string[] = ContezzaObjectUtils.findKeys(
            source,
            (subsource) => !subsource || typeof subsource !== 'object' || ContezzaDynamicSourceProcessorService.isSource(subsource)
        );

        if (foundSources.length) {
            return combineLatest(
                // step2: process each source object separately
                foundSources.map((property) =>
                    this.processElementarySource(ContezzaDynamicSourceProcessorService.makeElementarySource(property ? ObjectUtils.getValue(source, property) : source), loading)
                )
            ).pipe(
                map((data) => {
                    const parsedData = {};
                    foundSources.forEach((key, index) => (parsedData[key] = data[index]));
                    return parsedData;
                }),
                map((data) => {
                    let output: T = (Array.isArray(source) ? [] : {}) as T;
                    // step 3: replace properties in the original source based on processed source objects data
                    Object.entries(data).forEach(([key, value]) => {
                        if (key) {
                            ContezzaObjectUtils.setValue(output, key, value);
                        } else {
                            output = value as T;
                        }
                    });
                    return output;
                })
            );
        } else {
            return of(source);
        }
    }
}

export interface ContezzaDynamicSource {
    readonly type?: string;
    readonly 'dynamic-source': any;
    readonly error?: string;
    readonly filters?: ContezzaIdResolverSource[];
    readonly parameters?: any;
}

interface ContezzaElementarySource {
    readonly type: string;
    readonly source: any;
    readonly error?: string;
    readonly filters?: ContezzaIdResolverSource[];
    readonly parameters?: any;
}
