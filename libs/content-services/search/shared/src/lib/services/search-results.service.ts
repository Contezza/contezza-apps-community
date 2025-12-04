import { Injectable, Optional } from '@angular/core';

import { Store } from '@ngrx/store';

import {
    BehaviorSubject,
    catchError,
    combineLatest,
    debounceTime,
    EMPTY,
    filter,
    map,
    merge,
    Observable,
    of,
    pluck,
    share,
    shareReplay,
    Subject,
    switchMap,
    take,
    tap,
} from 'rxjs';

import { GenericFacetResponse, NodePaging, RequestPagination, ResultSetPaging, SearchRequest } from '@alfresco/js-api';

import { ErrorHandler, openErrorDetailsDialog } from '@contezza/core/notifications';
import { ContezzaUtils, StringUtils } from '@contezza/core/utils';
import { QueryMode } from '@contezza/dynamic-forms/shared';

import { SearchParameters, SearchTemplateParameters } from '../models';
import { ContentServicesSearchExtensionService } from './extension.service';
import { SearchParametersStore } from './component-stores';

/**
 * Injectable subject that allows to externally trigger the `searching$` state.
 * This is useful in double-query constructions, i.e. if a filter needs to perform an internal search first in order to construct the main query.
 * NB: this is combined with the intern `searching$` state using `merge`, not `combineLatest`.
 */
@Injectable()
export class SearchingService extends Subject<boolean> {}

@Injectable()
export class SearchResultsService {
    private static getEmptyResultWithPaging(paging: RequestPagination): ResultSetPaging {
        return {
            list: {
                entries: [],
                pagination: {
                    ...paging,
                    count: 0,
                    totalItems: 0,
                    hasMoreItems: false,
                },
            },
        };
    }

    private readonly searchingSource = new BehaviorSubject<boolean>(true);
    readonly searching$ = merge(this.searchingSource.asObservable(), this.externSearching$?.asObservable() || EMPTY);

    private readonly searchTrigger = new BehaviorSubject<void>(undefined);

    private readonly manualResultsSource = new BehaviorSubject<ResultSetPaging | null>(null);
    private readonly manualResults$ = this.manualResultsSource.asObservable().pipe(filter((r): r is ResultSetPaging => r !== null));

    private readonly _results$: Observable<ResultSetPaging> = combineLatest([this.searchParametersStore.parameters$, this.searchTrigger]).pipe(
        // first emit searching, then filter if searchParameters is switched off
        tap(() => this.searchingSource.next(true)),
        pluck(0),
        filter((searchParameters): searchParameters is SearchParameters => !!searchParameters),
        switchMap((searchParameters) =>
            this.doSearch(searchParameters).pipe(
                // catchError must be here to allow the flow to recover after an error
                catchError((e) => {
                    console.error(e);
                    const payload = ErrorHandler.formatError(e);
                    if (payload) {
                        this.store.dispatch(openErrorDetailsDialog({ payload }));
                    }
                    return of(undefined);
                })
            )
        ),
        tap(() => this.searchingSource.next(false)),
        share()
    );

    get results$(): Observable<NodePaging> {
        const base$ = of(void 0).pipe(
            switchMap(() => {
                switch (this._queryMode) {
                    case QueryMode.ON_TRIGGER:
                        return merge(
                            this.searchParametersStore.state$.pipe(
                                debounceTime(100),
                                map(({ paging }) => SearchResultsService.getEmptyResultWithPaging(paging)),
                                take(1)
                            ),
                            this._results$
                        );
                    default:
                        return this._results$;
                }
            })
        );

        return merge(this.manualResults$, base$).pipe(
            tap(() => this.searchingSource.next(false)),
            shareReplay(1)
        ) as Observable<NodePaging>;
    }

    readonly facets$: Observable<Record<string, GenericFacetResponse>> = this._results$.pipe(
        map((results) => results?.list.context?.facets),
        map((facets) => {
            const output = {};
            facets?.forEach((facet) => (output[ContezzaUtils.labelToId(facet.label)] = facet));
            return output;
        })
    );

    strategyId = 'default';

    private _queryTemplate: (_: SearchTemplateParameters) => string;
    set queryTemplate(queryTemplate: string | Partial<SearchRequest>) {
        let stringTemplate: string;
        if (typeof queryTemplate === 'string') {
            stringTemplate = queryTemplate;
        } else {
            stringTemplate = JSON.stringify(queryTemplate);
            if (!stringTemplate.includes('sort')) {
                stringTemplate = stringTemplate.replace(/}$/, ', "sort": [${sorting}]}');
            }
            if (!stringTemplate.includes('paging')) {
                stringTemplate = stringTemplate.replace(/}$/, ', "paging": ${paging}}');
            }
        }
        this._queryTemplate = StringUtils.toTemplate(stringTemplate);
    }

    private _queryMode: QueryMode = QueryMode.STREAM;
    set queryMode(queryMode: QueryMode) {
        this._queryMode = queryMode;
    }
    get queryMode(): QueryMode {
        return this._queryMode;
    }

    constructor(
        private readonly store: Store,
        private readonly search: ContentServicesSearchExtensionService,
        private readonly searchParametersStore: SearchParametersStore,
        @Optional() private readonly externSearching$?: SearchingService
    ) {}

    reload() {
        this.searchTrigger.next();
    }

    clearResults(): void {
        this.searchParametersStore.state$.pipe(take(1)).subscribe(({ paging }) => {
            this.manualResultsSource.next(SearchResultsService.getEmptyResultWithPaging(paging));
            this.searchingSource.next(false);
        });
    }

    private doSearch(parameters: SearchParameters): Observable<ResultSetPaging> {
        return this.search.getSearchStrategy(this.strategyId)({ template: this._queryTemplate, parameters });
    }
}
