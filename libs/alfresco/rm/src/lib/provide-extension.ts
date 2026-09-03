import { EnvironmentProviders, inject, makeEnvironmentProviders } from '@angular/core';

import { map, Observable } from 'rxjs';

import { Moment } from 'moment';

import { provideTranslations } from '@alfresco/adf-core';
import { provideExtensionConfig } from '@alfresco/adf-extensions';

import { provideMaps } from '@contezza/core/extensions';
import { provideWebscriptApiService } from '@contezza/core/services';
import { ApiUtils } from '@contezza/core/utils';

import { RmaApi, RmauditlogQueryParameters } from '@contezza/alfresco/rm/apis';
import { provideSearchStrategies } from '@contezza/content-services/search';

export function provideExtension(): EnvironmentProviders {
    return makeEnvironmentProviders([
        provideTranslations('alfresco/rm', 'assets/alfresco/rm'),
        provideExtensionConfig([
            'alfresco.rm.actions.json',
            'alfresco.rm.icons.json',
            'alfresco.rm.rules.json',
            'alfresco.rm.search-page-configs.json',
            'alfresco.rm.dynamic-forms.json',
            'alfresco.rm.columns.json',
        ]),
        provideWebscriptApiService(RmaApi),
        provideSearchStrategies({
            'rm.search-strategies.auditlog':
                (rmaApi = inject(RmaApi)) =>
                ({ parameters }) => {
                    const { skipCount, maxItems } = parameters.paging;

                    return rmaApi
                        .readRmauditlog({
                            ...(ApiUtils.stringToQueryParameters(parameters.leftSidebarQuery!) as unknown as RmauditlogQueryParameters),
                            size: maxItems,
                        })
                        .pipe(
                            map(response => {
                                const hasMoreItems = response.data.entries.length === maxItems! + 1;
                                const entries = response.data.entries.slice(0, maxItems).map(entry => ({ entry }) as any);
                                const totalItems = (skipCount || 0) + response.data.entries.length;
                                return {
                                    list: {
                                        entries,
                                        pagination: {
                                            hasMoreItems,
                                            totalItems,
                                            maxItems,
                                            skipCount,
                                        },
                                    },
                                };
                            }),
                        );
                },
        }),
        provideMaps({
            'alfresco.rm.formatQueryParams': () => ($: Observable<Record<string, string> | undefined>) => $.pipe(map(value => (value ? Object.values(value).join('&') : ''))),
            'alfresco.rm.dateRange': () => ($: Observable<{ from: Moment | null; to: Moment | null } | undefined>) =>
                $.pipe(
                    map(value => {
                        if (value) {
                            const { from, to } = value;
                            return [
                                //
                                from ? 'from=' + from.format('YYYY-MM-DD') : undefined,
                                to ? 'to=' + to.format('YYYY-MM-DD') : undefined,
                            ]
                                .filter(Boolean)
                                .join('&');
                        } else {
                            return '';
                        }
                    }),
                ),
        }),
    ]);
}

export { provideExtension as provideAlfrescoRmExtension };
