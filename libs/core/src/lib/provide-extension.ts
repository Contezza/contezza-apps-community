import { EnvironmentProviders, inject, makeEnvironmentProviders } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';

import { Store } from '@ngrx/store';

import { delay, distinctUntilChanged, filter, map, Observable, of, startWith, switchMap, take } from 'rxjs';

import { Moment } from 'moment';

import { getUserProfile } from '@alfresco/aca-shared/store';
import { NodesApiService, SearchService } from '@alfresco/adf-content-services';
import { AppConfigService, LocalizedDatePipe, ObjectUtils, provideTranslations } from '@alfresco/adf-core';
import { ExtensionService } from '@alfresco/adf-extensions';
import { ResultSetPaging } from '@alfresco/js-api';

import {
    Operator,
    provideAuthGuards,
    provideElementaryOperators,
    provideEvaluatorGroups,
    provideEvaluators,
    provideMaps,
    provideOperators,
    provideSourceTypes,
} from '@contezza/core/extensions';
import { RouteRuleGuard } from '@contezza/core/guards';
import { WebscriptService } from '@contezza/core/services';
import { ContezzaRouterState, selectRouteParams } from '@contezza/core/stores';
import { AdfUtils, ContezzaObjectUtils, ContezzaObservableOperators, ContezzaObservables, ContezzaQueries, ContezzaUtils, OrArray } from '@contezza/core/utils';

export function provideExtension(): EnvironmentProviders {
    return makeEnvironmentProviders([
        provideTranslations('core', 'assets/core'),
        provideEvaluators({
            // app.selection.isFile
            ...AdfUtils.makeRules('isFile', ({ isFile }) => isFile),
            'app.selection.single': ({ selection }) => selection?.count === 1,
            'auth.isOauth': context => context.auth.isOauth(),
            'user.groups.includeSome': ({ profile }, ...groups: string[]) => {
                const userGroupIds = profile?.groups?.map(({ id }) => id);
                return userGroupIds?.length && groups.some(group => userGroupIds.includes(group));
            },
        }),
        provideEvaluatorGroups({
            // rules starting with `context=>` are evaluated as js
            '^(context|\\(context\\))\\s{0,1}=>': (ruleId, context) => ContezzaUtils.stringToFunction(ruleId)(context),
        }),
        provideAuthGuards({
            'route-rule': RouteRuleGuard,
        }),
        provideElementaryOperators({
            ...(ContezzaObservableOperators as unknown as Record<string, Operator>),
        }),
        provideOperators({
            delay: () => delay,
            startWith: () => startWith,
            translate: (translate = inject(TranslateService)) =>
                map((value: string | { key: string; interpolateParams?: any }) =>
                    typeof value === 'string' ? translate.instant(value) : translate.instant(value.key, value.interpolateParams),
                ),
            localizedDate: (localizedDatePipe = inject(LocalizedDatePipe)) => map((date: string | number | Date) => localizedDatePipe.transform(date)),
            getNodeById: (nodes = inject(NodesApiService)) => switchMap((id: string) => nodes.getNode(id)),
            webscript: (webscript = inject(WebscriptService)) => switchMap((url: string) => webscript.get(url)),
            search: (search = inject(SearchService)) =>
                switchMap((value: string) => {
                    const MAX_ITEMS = 100;
                    return ContezzaObservables.while<ResultSetPaging>(
                        (response, i) => response?.list.pagination.totalItems > i * MAX_ITEMS,
                        (_, i) =>
                            search.searchByQueryBody({
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
                        },
                    ).pipe(map(res => res?.list?.entries ?? []));
                }),
        }),
        provideMaps({
            dateRangeQuery: () => ContezzaQueries.dateRange,
            booleanQuery: () => ContezzaQueries.boolean,
            isoCompleteDate: () => ContezzaQueries.isoCompleteDate,
            dateQuery: () => ContezzaQueries.date,
            map:
                () =>
                (callback: string) =>
                (source: Observable<unknown>): Observable<string> =>
                    source.pipe(ContezzaObservableOperators.map(callback)),
            formatDate: () => (format: string) => ($: Observable<Moment | null>) => $.pipe(map(date => (date ? date.format(format) : date))),
            translateBoolean:
                (translate = inject(TranslateService)) =>
                (key: string) =>
                ($: Observable<object>) =>
                    $.pipe(
                        map(item => {
                            const value = ContezzaObjectUtils.getValue(item, key);
                            if (typeof value === 'boolean') {
                                return value ? translate.instant('APP.LABELS.YES') : translate.instant('APP.LABELS.NO');
                            }
                            return value;
                        }),
                    ),
        }),
        provideSourceTypes({
            config:
                (config = inject(AppConfigService)) =>
                source =>
                    of(config.get<any[]>(source)),
            webscript:
                (webscript = inject(WebscriptService)) =>
                source =>
                    webscript.get(source),
            search:
                (search = inject(SearchService)) =>
                source =>
                    search
                        .searchByQueryBody({
                            query: {
                                query: source,
                                language: 'afts',
                            },
                            include: ['path', 'properties', 'allowableOperations', 'permissions', 'aspectNames'],
                        })
                        .pipe(map(res => res?.list?.entries ?? [])),
            store:
                (store = inject(Store)) =>
                source =>
                    store.pipe(
                        map(state => ObjectUtils.getValue(state, source)),
                        take(1),
                    ),
            userProfile:
                (store = inject(Store)) =>
                source =>
                    store.select(getUserProfile).pipe(
                        filter(profile => !!profile?.id),
                        map(profile => ContezzaObjectUtils.getValue(profile, source)),
                        take(1),
                    ),
            value: () => source => of(source),
            extensionFeature:
                (extensions = inject(ExtensionService)) =>
                id =>
                    of(AdfUtils.filterAndSortFeature(extensions.getFeature(id))),
            routeParams:
                (store = inject<Store<ContezzaRouterState>>(Store)) =>
                (source?: OrArray<string>) =>
                    store.select(selectRouteParams).pipe(
                        map(params =>
                            source
                                ? typeof source === 'string'
                                    ? params[source]
                                    : source.reduce((acc, x) => {
                                          acc[x] = params[x];
                                          return acc;
                                      }, {})
                                : params,
                        ),
                        distinctUntilChanged((oldValue, newValue) =>
                            source ? (typeof source === 'string' ? oldValue === newValue : source.every(key => oldValue[key] === newValue[key])) : false,
                        ),
                    ),
        }),
    ]);
}

export { provideExtension as provideCoreExtension };
