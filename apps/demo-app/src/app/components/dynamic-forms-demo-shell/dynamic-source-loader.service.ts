import { Injectable } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';

import { Store } from '@ngrx/store';

import { Observable, of } from 'rxjs';
import { filter, map, switchMap, take } from 'rxjs/operators';

import { AppConfigService, NodesApiService, ObjectUtils } from '@alfresco/adf-core';
import { getUserProfile } from '@alfresco/aca-shared/store';
import { ExtensionService } from '@alfresco/adf-extensions';
import { SearchService } from '@alfresco/adf-content-services';

import { WebscriptService } from '@contezza/core/services';
import { ContezzaIdResolverService } from '@contezza/core/extensions';
import { ContezzaAdfUtils, ContezzaObjectUtils, ContezzaObservableOperators, ContezzaQueries } from '@contezza/core/utils';

@Injectable({
    providedIn: 'root',
})
export class ContezzaDynamicSourceLoaderService {
    constructor(
        private readonly translate: TranslateService,
        private readonly nodes: NodesApiService,
        private readonly idResolver: ContezzaIdResolverService,
        private readonly config: AppConfigService,
        private readonly store: Store,
        private readonly webscript: WebscriptService,
        private readonly search: SearchService,
        private readonly extensions: ExtensionService
    ) {
        this.loadDefault();
    }

    loadDefault() {
        this.setOperators({ ...ContezzaObservableOperators });
        this.setOperators({ translate: map((value: string) => this.translate.instant(value)) });
        this.setOperators({
            getNodeById: switchMap((id: string) => this.nodes.getNode(id)),
            webscript: switchMap((url: string) => this.webscript.get(url)),
            search: switchMap((value: string) =>
                this.search
                    .searchByQueryBody({
                        query: {
                            query: value,
                            language: 'afts',
                        },
                        include: ['path', 'properties', 'allowableOperations', 'permissions'],
                        sort: [
                            {
                                type: 'FIELD',
                                field: 'name',
                                ascending: true,
                            },
                        ],
                    })
                    .pipe(map((res) => res?.list?.entries ?? []))
            ),
        });

        this.setSourceTypes({
            config: (source) => of(this.config.get<any[]>(source)),
            webscript: (source) => this.webscript.get(source),
            search: (source) =>
                this.search
                    .searchByQueryBody({
                        query: {
                            query: source,
                            language: 'afts',
                        },
                        include: ['path', 'properties', 'allowableOperations', 'permissions'],
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
            extensionFeature: (id) => of(ContezzaAdfUtils.filterAndSortFeature(this.extensions.getFeature(id))),
        });

        this.setMaps({
            dateRangeQuery: ContezzaQueries.dateRange,
            booleanQuery: ContezzaQueries.boolean,
            isoCompleteDate: ContezzaQueries.isoCompleteDate,
            dateQuery: ContezzaQueries.date,
        });
    }

    setOperators(values: Record<string, any>) {
        if (values) {
            this.idResolver.set(values, 'operator');
        }
    }

    setMaps(values: Record<string, any>) {
        if (values) {
            this.idResolver.set(values, 'map');
        }
    }

    setSourceTypes(values: Record<string, (value: string, options?: any) => Observable<any>>) {
        if (values) {
            this.idResolver.set(values, 'sourceType');
        }
    }
}
