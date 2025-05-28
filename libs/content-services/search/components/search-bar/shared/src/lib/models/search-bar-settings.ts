import { SearchRequest } from '@alfresco/js-api';

import { FacetSelection } from '@contezza/content-services/search/components/facet-suggestions/shared';

import { ExtendedResultSettings } from './result-settings';

export interface SearchBarSettings {
    queryTemplate: string | Partial<SearchRequest>;
    searchQueryFields?: string[];
    searchQuery?: string;
    searchQueryTemplate?: (_: { value: string }) => string;
    facetSelection: FacetSelection[];
    minChars?: number;
    resultSettings?: ExtendedResultSettings;
}
