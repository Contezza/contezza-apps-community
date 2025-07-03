import { NgModule } from '@angular/core';

import { of, tap } from 'rxjs';

import { provideTranslations } from '@alfresco/adf-core';
import { FavoritesApiService, NodesApiService, SearchService, SitesService } from '@alfresco/adf-content-services';
import { ExtensionService as AdfExtensionService, provideExtensionConfig } from '@alfresco/adf-extensions';

import { ContezzaObservables } from '@contezza/core/utils';

import { ContentServicesExtensionModule } from '@contezza/content-services';
import { ContentServicesExtensionService } from '@contezza/content-services/shared';
import { ContentServicesPresetsExtensionModule } from '@contezza/content-services/presets';
import { ContentServicesSearchExtensionService, SearchParameters, SortingUtils } from '@contezza/content-services/search/shared';

import * as rules from './rules';

@NgModule({
    imports: [ContentServicesExtensionModule, ContentServicesPresetsExtensionModule],
    // imports: [EffectsModule.forFeature([Effects])],
    providers: [
        provideTranslations('content-services/search', 'assets/content-services/search'),
        provideExtensionConfig([
            'content-services.search.actions.json',
            'content-services.search.icons.json',
            'content-services.search.rules.json',
            'search-table-page.document-lists.json',
            'search-table-page.dynamicforms.json',
        ]),
    ],
})
export class ExtensionModule {
    constructor(
        favorites: FavoritesApiService,
        nodes: NodesApiService,
        search: SearchService,
        sites: SitesService,
        extensions: AdfExtensionService,
        csExtensions: ContentServicesExtensionService,
        searchExtensions: ContentServicesSearchExtensionService
    ) {
        extensions.setEvaluators({
            'search-table-page.target.isSearchTablePage': rules.isSearchTablePage,
            'search-table-page.target.hasIdIn': rules.hasIdIn,
            'search-table-page.target.hasTypeIn': rules.hasTypeIn,
        });

        csExtensions.setActions<any>({
            'actions.search-bar': () => import('./components/actions/search-bar.action.component').then((_) => _.SearchBarActionComponent),
            'app.components.toggle-filters-button': () => import('./components/actions/toggle-filters-button.component').then((_) => _.ToggleFiltersButtonComponent),
        });

        searchExtensions.setSearchResultsViews({
            'search-results-views.table': () => import('./components/search-results-views/table.search-results-view.component').then((_) => _.TableSearchResultsViewComponent),
        });

        searchExtensions.setSearchResultPreviews({
            'search-result-previews.viewer': () =>
                import('./components/search-result-previews/viewer.search-result-preview.component').then((_) => _.ViewerSearchResultPreviewComponent),
        });

        searchExtensions.setSearchStrategies({
            default: (payload) => searchExtensions.searchDefault(payload),
            'browse-files': ({ template, parameters }) => {
                const { currentFolder } = parameters;
                if (currentFolder) {
                    const activeQueries = (Object.keys(parameters) as (keyof SearchParameters)[]).filter((key) => !!parameters[key] && key.endsWith('Query'));
                    if (activeQueries.length === 0) {
                        // if no active queries, then do node children call
                        return nodes.getNodeChildren(currentFolder.id, {
                            include: ['path', 'properties', 'allowableOperations', 'permissions', 'aspectNames', 'isFavorite', 'definition'],
                            ...parameters.paging,
                            orderBy: SortingUtils.searchToNodesApi(parameters.sorting),
                            where: '(assocType=cm:contains)',
                        });
                    } else {
                        return search.searchByQueryBody(
                            ContentServicesSearchExtensionService.makeSearchQuery(template, {
                                ...parameters,
                                headerQuery: activeQueries.includes('headerQuery')
                                    ? // if headerQuery is active, then use currentFolder in an ANCESTOR call
                                      `(${parameters.headerQuery}) AND ANCESTOR:"workspace://SpacesStore/${currentFolder.id}"`
                                    : // otherwise use currentFolder in a PARENT call
                                      `PARENT:"workspace://SpacesStore/${currentFolder.id}"`,
                            })
                        );
                    }
                } else {
                    return search.searchByQueryBody(ContentServicesSearchExtensionService.makeSearchQuery(template, parameters));
                }
            },
            sites: ({ parameters }) => {
                const term = parameters.headerQuery;
                const options = {
                    ...parameters.paging,
                    orderBy: SortingUtils.searchToNodesApi(parameters.sorting),
                };
                return (term ? ContezzaObservables.from(() => search.queriesApi.findSites(term, options)) : sites.getSites(options)) as any;
            },
            favorites: ({ parameters }) =>
                ContezzaObservables.from(() =>
                    favorites.favoritesApi.listFavorites('-me-', {
                        ...parameters.paging,
                        where: parameters.baseQuery,
                        include: ['path', 'properties', 'allowableOperations', 'permissions', 'aspectNames', 'definition'],
                    })
                ).pipe(
                    tap((results) => {
                        results.list.entries.forEach((entry) => {
                            Object.assign(entry.entry, entry.entry.target.file || entry.entry.target.folder || entry.entry.target.site);
                            // if file or folder then delete guid, to prevent confusion with site
                            if (entry.entry.target.file || entry.entry.target.folder) {
                                delete entry.entry['guid'];
                            }
                            delete entry.entry.target;
                        });
                    })
                ) as any,
            /**
             * Returns a list of extension elements as search results.
             * The key used to retrieve the elements is defined by the template.
             *
             * @param template
             */
            extensionElements: ({ template }) => {
                const extensionKey = template({});
                const results = extensions.getElements(extensionKey, []);
                return of({ list: { entries: results.map((entry) => ({ entry })) } });
            },
        });
    }
}

export { ExtensionModule as ContentServicesSearchExtensionModule };
