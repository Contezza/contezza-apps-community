import { Injectable } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';

import { Store } from '@ngrx/store';

import { delay, distinctUntilChanged, filter, map, Observable, of, startWith, switchMap, take } from 'rxjs';

import { Moment } from 'moment';

import { ResultSetPaging } from '@alfresco/js-api';
import { AppConfigService, LocalizedDatePipe, ObjectUtils } from '@alfresco/adf-core';
import { NodesApiService, SearchService } from '@alfresco/adf-content-services';
import { ExtensionService } from '@alfresco/adf-extensions';
import { getUserProfile } from '@alfresco/aca-shared/store';

import { ContezzaIdResolverService, ContezzaIdResolverSource, DynamicSourceExtensionService, RuleService } from '@contezza/core/extensions';
import { RouteRuleGuard } from '@contezza/core/guards';
import { WebscriptService } from '@contezza/core/services';
import { ContezzaRouterState, selectRouteParams } from '@contezza/core/stores';
import { AdfUtils, ContezzaObjectUtils, ContezzaObservableOperators, ContezzaObservables, ContezzaQueries, ContezzaUtils, OrArray } from '@contezza/core/utils';

@Injectable({ providedIn: 'root' })
export class ExtensionLoaderService {
    constructor(
        private readonly extensions: ExtensionService,
        private readonly dynamicSourceExtensions: DynamicSourceExtensionService,
        private readonly ruleService: RuleService,
        private readonly translate: TranslateService,
        private readonly nodes: NodesApiService,
        private readonly localizedDatePipe: LocalizedDatePipe,
        private readonly idResolver: ContezzaIdResolverService,
        private readonly config: AppConfigService,
        private readonly store: Store,
        private readonly webscript: WebscriptService,
        private readonly search: SearchService
    ) {}

    loadDefaults() {
        this.extensions.setEvaluators({
            'app.selection.single': ({ selection }) => selection?.count === 1,
        });
        this.extensions.setAuthGuards({
            'route-rule': RouteRuleGuard,
        });

        this.ruleService.setEvaluatorGroups({
            // rules starting with `context=>` are evaluated as js
            '^(context|\\(context\\))\\s{0,1}=>': (ruleId, context) => ContezzaUtils.stringToFunction(ruleId)(context),
        });

        this.dynamicSourceExtensions.setOperators({ delay, startWith });
        this.dynamicSourceExtensions.setOperators({ ...ContezzaObservableOperators });
        this.dynamicSourceExtensions.setOperators({
            translate: map((value: string | { key: string; interpolateParams?: any }) =>
                typeof value === 'string' ? this.translate.instant(value) : this.translate.instant(value.key, value.interpolateParams)
            ),
            localizedDate: map((date: string | number | Date) => this.localizedDatePipe.transform(date)),
        });
        this.dynamicSourceExtensions.setOperators({
            getNodeById: switchMap((id: string) => this.nodes.getNode(id)),
            webscript: switchMap((url: string) => this.webscript.get(url)),
            search: switchMap((value: string) => {
                const MAX_ITEMS = 100;
                return ContezzaObservables.while<ResultSetPaging>(
                    (response, i) => response?.list.pagination.totalItems > i * MAX_ITEMS,
                    (_, i) =>
                        this.search.searchByQueryBody({
                            query: {
                                query: value,
                                language: 'afts',
                            },
                            include: ['path', 'properties', 'allowableOperations', 'permissions', 'aspectNames'],
                            sort: [
                                {
                                    type: 'FIELD',
                                    field: 'name',
                                    ascending: true,
                                },
                            ],
                            paging: { maxItems: MAX_ITEMS, skipCount: i * MAX_ITEMS },
                        }),
                    (response1, response2) => {
                        response1.list.entries = response1.list.entries.concat(response2.list.entries);
                        return response1;
                    }
                ).pipe(map((res) => res?.list?.entries ?? []));
            }),
        });

        this.dynamicSourceExtensions.setSourceTypes({
            config: (source) => of(this.config.get<any[]>(source)),
            webscript: (source) => this.webscript.get(source),
            search: (source) =>
                this.search
                    .searchByQueryBody({
                        query: {
                            query: source,
                            language: 'afts',
                        },
                        include: ['path', 'properties', 'allowableOperations', 'permissions', 'aspectNames'],
                    })
                    .pipe(map((res) => res?.list?.entries ?? [])),
            store: (source) =>
                this.store.pipe(
                    map((store) => ObjectUtils.getValue(store, source)),
                    take(1)
                ),
            userProfile: (source) =>
                this.store.select(getUserProfile).pipe(
                    filter((profile) => !!profile?.id),
                    map((profile) => ContezzaObjectUtils.getValue(profile, source)),
                    take(1)
                ),
            value: (source) => of(source),
            extensionFeature: (id) => of(AdfUtils.filterAndSortFeature(this.extensions.getFeature(id))),
            routeParams: (source?: OrArray<string>) =>
                (this.store as Store<ContezzaRouterState>).select(selectRouteParams).pipe(
                    map((params) =>
                        source
                            ? typeof source === 'string'
                                ? params[source]
                                : source.reduce((acc, x) => {
                                      acc[x] = params[x];
                                      return acc;
                                  }, {})
                            : params
                    ),
                    distinctUntilChanged((oldValue, newValue) =>
                        source ? (typeof source === 'string' ? oldValue === newValue : source.every((key) => oldValue[key] === newValue[key])) : false
                    )
                ),
        });

        this.dynamicSourceExtensions.setMaps({
            dateRangeQuery: ContezzaQueries.dateRange,
            booleanQuery: ContezzaQueries.boolean,
            isoCompleteDate: ContezzaQueries.isoCompleteDate,
            dateQuery: ContezzaQueries.date,
            map:
                (callback: string) =>
                (source: Observable<unknown>): Observable<string> =>
                    source.pipe(ContezzaObservableOperators.map(callback)),
            'dynamic-source': (filters: ContezzaIdResolverSource[]) => {
                const resolvedFilters = filters.map((flt) => this.idResolver.resolve(flt, 'operator'));
                return ($) => $.pipe(...resolvedFilters);
            },
            formatDate: (format: string) => ($: Observable<Moment | null>) => $.pipe(map(date => (date ? date.format(format) : date))),
            translateBoolean: (key: string) => ($: Observable<object>) =>
                $.pipe(
                    map(item => {
                        const value = ContezzaObjectUtils.getValue(item, key);
                        if (typeof value === 'boolean') {
                            return value ? this.translate.instant('APP.LABELS.YES') : this.translate.instant('APP.LABELS.NO');
                        }
                        return value;
                    }),
                ),
        });
    }
}
