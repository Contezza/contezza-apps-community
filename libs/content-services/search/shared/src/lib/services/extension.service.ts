import { Injectable } from '@angular/core';

import { SearchRequest } from '@alfresco/js-api';
import { SearchService } from '@alfresco/adf-content-services';
import { ExtensionElement, ExtensionService as AdfExtensionService } from '@alfresco/adf-extensions';

import { ComponentResolver, DynamicComponentExtensionService } from '@contezza/core/dynamic-component/shared';
import { ContezzaIdResolverService } from '@contezza/core/extensions';

import { ExtendedSearchTableLayoutSettings, ISearchResultPreview, ISearchResultsView, SearchParameters, SearchStrategy, SearchTemplateParameters } from '../models';

@Injectable({ providedIn: 'root' })
export class ExtensionService {
    static readonly FEATURE_KEY_SEARCH_PAGE_CONFIGS = 'searchTablePageConfigs';

    static readonly TYPE_SEARCH_STRATEGY = 'searchStrategy';

    constructor(
        private readonly search: SearchService,
        private readonly extensions: AdfExtensionService,
        private readonly dc: DynamicComponentExtensionService,
        private readonly idResolver: ContezzaIdResolverService
    ) {}

    getSearchPageConfigurationByKey(key: string): ExtendedSearchTableLayoutSettings {
        const output = this.extensions
            .getFeature<(ExtendedSearchTableLayoutSettings & ExtensionElement)[]>(ExtensionService.FEATURE_KEY_SEARCH_PAGE_CONFIGS)
            ?.find(({ id }) => id === key);
        if (!output) {
            throw new Error('No search page configuration with key ' + key);
        }
        return output;
    }

    /**
     * Wraps {@link AdfExtensionService}`.setComponents` while checking that the given components implement the {@link ISearchResultsView} interface.
     * Please follow this name convention for search-results-view-component ids:
     * <code>
     * <module>.<submodules?>.search-results-views.<component-name>
     * </code>
     * where `component-name` is the component class name without suffix 'SearchResultsViewComponent' in kebab-case,
     * e.g. the `component-name` of `TableSearchResultsViewComponent` is `table`.
     *
     * @param searchResultsViews
     */
    setSearchResultsViews(searchResultsViews: Record<string, ComponentResolver<ISearchResultsView<any>>>) {
        this.dc.setComponents(searchResultsViews);
    }

    /**
     * Wraps {@link AdfExtensionService}`.setComponents` while checking that the given components implement the {@link ISearchResultPreview} interface.
     * Please follow this name convention for search-result-preview-component ids:
     * <code>
     * <module>.<submodules?>.search-result-previews.<component-name>
     * </code>
     * where `component-name` is the component class name without suffix 'SearchResultPreviewComponent' in kebab-case,
     * e.g. the `component-name` of `ViewerSearchResultPreviewComponent` is `viewer`.
     *
     * @param searchResultPreviews
     */
    setSearchResultPreviews(searchResultPreviews: Record<string, ComponentResolver<ISearchResultPreview<any>>>) {
        this.dc.setComponents(searchResultPreviews);
    }
    /**
     * Wraps {@link ContezzaIdResolverService}`.set` while checking that the given objects implement the {@link SearchStrategy} interface.
     * Please follow this name convention for search-strategy ids:
     * <code>
     * <module>.<submodules?>.search-strategies.<id>
     * </code>
     *
     * @param searchStrategies
     */
    setSearchStrategies(searchStrategies: Record<string, SearchStrategy<any>>) {
        this.idResolver.set(searchStrategies, ExtensionService.TYPE_SEARCH_STRATEGY);
    }

    getSearchStrategy(id: string): SearchStrategy {
        return this.idResolver.resolve(id, ExtensionService.TYPE_SEARCH_STRATEGY);
    }

    searchDefault: SearchStrategy = ({ template, parameters }) => this.search.searchByQueryBody(ExtensionService.makeSearchQuery(template, parameters));

    static makeSearchQuery(
        template: (_: SearchTemplateParameters) => string,
        { baseQuery, headerQuery, columnQuery, sidebarQuery, filterQuery, sorting, paging }: SearchParameters
    ): SearchRequest {
        const patchForJSON = (x: string): string => x.replace(/"/g, `'`).replace(/\\/g, `\\\\`);
        const makeTemplateParameter = (key: string, x?: string) => (x || x === '' ? { [key]: patchForJSON(x || '*') } : {});
        const parsed = JSON.parse(
            template({
                ...(baseQuery ? { baseQuery: patchForJSON(baseQuery) } : {}),
                query:
                    [headerQuery, columnQuery, sidebarQuery, filterQuery]
                        .filter((value) => !!value)
                        .map(patchForJSON)
                        .map((value) => `(${value})`)
                        .join(' AND ') || '*',
                ...makeTemplateParameter('headerQuery', headerQuery),
                ...makeTemplateParameter('columnQuery', columnQuery),
                ...makeTemplateParameter('sidebarQuery', sidebarQuery),
                ...makeTemplateParameter('filterQuery', filterQuery),
                sorting: JSON.stringify(sorting),
                paging: JSON.stringify(paging),
            })
        );
        if (Object.keys(sorting).length === 0) {
            delete parsed.sort;
        }
        return parsed;
    }
}

export { ExtensionService as ContentServicesSearchExtensionService };
