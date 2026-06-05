import { inject, NgModule } from '@angular/core';

import { forkJoin, map, of, tap } from 'rxjs';

import { FavoritesApiService, NodesApiService, SearchService, SitesService } from '@alfresco/adf-content-services';
import { provideTranslations } from '@alfresco/adf-core';
import { ExtensionService as AdfExtensionService, provideExtensionConfig } from '@alfresco/adf-extensions';

import { provideEvaluators } from '@contezza/core/extensions';
import { AdfUtils, AlfrescoUtils, ContezzaObservables, Property } from '@contezza/core/utils';

import { ContentServicesExtensionModule } from '@contezza/content-services';
import { ContentServicesPresetsExtensionModule } from '@contezza/content-services/presets';
import { ContentServicesSearchExtensionService, SearchParameters, SortingUtils } from '@contezza/content-services/search/shared';
import { ContentServicesExtensionService } from '@contezza/content-services/shared';
import { provideDynamicFormFieldComponents } from '@contezza/dynamic-forms/shared';

import { provideSearchStrategies } from './providers';
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
        provideEvaluators({
            // app.selection.hasUpdatePermissions
            ...AdfUtils.makeRules('hasUpdatePermissions', (node, context) => context.permissions.check(node, ['update']), { prefix: 'app' }),
            // app.selection.canUpdate
            ...AdfUtils.makeRules(
                'canUpdate',
                (node, context) => {
                    if (context.permissions.check(node, ['update'])) {
                        const lockOwner = AlfrescoUtils.getNodePropertyValue(node, new Property('cm:lockOwner', _ => _ as { id: string }));
                        return !lockOwner || lockOwner.id === context.profile.id;
                    } else {
                        return false;
                    }
                },
                { prefix: 'app' },
            ),
            // app.selection.hasDeletePermissions
            ...AdfUtils.makeRules('hasDeletePermissions', (node, context) => context.permissions.check(node, ['delete']), { prefix: 'app' }),
            // app.selection.isOwner
            ...AdfUtils.makeRules(
                'isOwner',
                (node, context) => {
                    const owner = AlfrescoUtils.getNodePropertyValue(node, new Property('cm:owner', _ => _ as { id: string }));
                    return owner && owner.id === context.profile.id;
                },
                { prefix: 'app' },
            ),
        }),
        provideDynamicFormFieldComponents({
            peoplePicker: () => import('@contezza/content-services/search/components/people-group-picker').then(m => m.PeopleGroupPickerFieldComponent),
        }),
        provideSearchStrategies({
            default:
                (search = inject(SearchService)) =>
                ({ template, parameters }) =>
                    search.searchByQueryBody(ContentServicesSearchExtensionService.makeSearchQuery(template, parameters)),
            'browse-files':
                (nodes = inject(NodesApiService), search = inject(SearchService)) =>
                ({ template, parameters }) => {
                    const { currentFolder } = parameters;
                    if (currentFolder) {
                        const activeQueries = (Object.keys(parameters) as (keyof SearchParameters)[]).filter(key => !!parameters[key] && key.endsWith('Query'));
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
                                }),
                            );
                        }
                    } else {
                        return search.searchByQueryBody(ContentServicesSearchExtensionService.makeSearchQuery(template, parameters));
                    }
                },
            'browse-files-with-facets':
                (nodes = inject(NodesApiService), search = inject(SearchService)) =>
                ({ template, parameters }) => {
                    const { currentFolder } = parameters;
                    if (currentFolder) {
                        const activeQueries = (Object.keys(parameters) as (keyof SearchParameters)[]).filter(key => !!parameters[key] && key.endsWith('Query'));
                        if (activeQueries.length === 0) {
                            // if no active queries, then do node-children call
                            return forkJoin([
                                nodes.getNodeChildren(currentFolder.id, {
                                    include: ['path', 'properties', 'allowableOperations', 'permissions', 'aspectNames', 'isFavorite', 'definition'],
                                    ...parameters.paging,
                                    orderBy: SortingUtils.searchToNodesApi(parameters.sorting),
                                    where: '(assocType=cm:contains)',
                                }),
                                // by every node-children call, perform also a search call
                                search.searchByQueryBody(
                                    ContentServicesSearchExtensionService.makeSearchQuery(template, {
                                        ...parameters,
                                        headerQuery: activeQueries.includes('headerQuery')
                                            ? // if headerQuery is active, then use currentFolder in an ANCESTOR call
                                              `(${parameters.headerQuery}) AND ANCESTOR:"workspace://SpacesStore/${currentFolder.id}"`
                                            : // otherwise use currentFolder in a PARENT call
                                              `PARENT:"workspace://SpacesStore/${currentFolder.id}"`,
                                    }),
                                ),
                            ]).pipe(
                                map(([childrenResponse, searchResponse]) => {
                                    // enrich the results of the node-children call with the facets from the search call and return them
                                    childrenResponse.list['context'] = searchResponse.list.context;
                                    return childrenResponse;
                                }),
                            );
                        } else {
                            return search.searchByQueryBody(
                                ContentServicesSearchExtensionService.makeSearchQuery(template, {
                                    ...parameters,
                                    headerQuery: activeQueries.includes('headerQuery')
                                        ? // if headerQuery is active, then use currentFolder in an ANCESTOR call
                                          `(${parameters.headerQuery}) AND ANCESTOR:"workspace://SpacesStore/${currentFolder.id}"`
                                        : // otherwise use currentFolder in a PARENT call
                                          `PARENT:"workspace://SpacesStore/${currentFolder.id}"`,
                                }),
                            );
                        }
                    } else {
                        return search.searchByQueryBody(ContentServicesSearchExtensionService.makeSearchQuery(template, parameters));
                    }
                },
        }),
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
        searchExtensions: ContentServicesSearchExtensionService,
    ) {
        extensions.setEvaluators({
            'search-table-page.target.isSearchTablePage': rules.isSearchTablePage,
            'search-table-page.target.hasIdIn': rules.hasIdIn,
            'search-table-page.target.hasTypeIn': rules.hasTypeIn,
        });
        extensions.setEvaluators(AdfUtils.makeRules('canCreate', (node, context) => context.permissions.check(node, ['create']), { prefix: 'app' }));
        extensions.setEvaluators(AdfUtils.makeRules('canUpload', (node, context) => context.permissions.check(node, ['create']), { prefix: 'app' }));
        // app.selection.canDelete
        // this must be placed here and not in provideEvaluators so that it can overwrite the one from default ACA
        extensions.setEvaluators(
            AdfUtils.makeRules(
                'canDelete',
                (node, context) => {
                    if (!('archivedAt' in node) && context.permissions.check(node, ['delete'])) {
                        const lockOwner = AlfrescoUtils.getNodePropertyValue(node, new Property('cm:lockOwner', _ => _ as { id: string }));
                        return !lockOwner || lockOwner.id === context.profile.id;
                    } else {
                        return false;
                    }
                },
                { prefix: 'app' },
            ),
        );

        csExtensions.setActions<any>({
            'actions.search-bar': () => import('./components/actions/search-bar.action.component').then(_ => _.SearchBarActionComponent),
            'app.components.toggle-filters-button': () => import('./components/actions/toggle-filters-button.component').then(_ => _.ToggleFiltersButtonComponent),
        });

        searchExtensions.setSearchResultsViews({
            'search-results-views.table': () => import('./components/search-results-views/table.search-results-view.component').then(_ => _.TableSearchResultsViewComponent),
        });

        searchExtensions.setSearchResultPreviews({
            'search-result-previews.viewer': () =>
                import('./components/search-result-previews/viewer.search-result-preview.component').then(_ => _.ViewerSearchResultPreviewComponent),
        });

        searchExtensions.setSearchStrategies({
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
                    }),
                ).pipe(
                    tap(results => {
                        results.list.entries.forEach(entry => {
                            Object.assign(entry.entry, entry.entry.target.file || entry.entry.target.folder || entry.entry.target.site);
                            // if file or folder then delete guid, to prevent confusion with site
                            if (entry.entry.target.file || entry.entry.target.folder) {
                                delete entry.entry['guid'];
                            }
                            delete entry.entry.target;
                        });
                    }),
                ) as any,
            /**
             * Returns a list of extension elements as search results.
             * The key used to retrieve the elements is defined by the template.
             *
             * @param template.template
             * @param template
             */
            extensionElements: ({ template }) => {
                const extensionKey = template({});
                const results = extensions.getElements(extensionKey, []);
                return of({ list: { entries: results.map(entry => ({ entry })) } });
            },
        });
    }
}

export { ExtensionModule as ContentServicesSearchExtensionModule };
