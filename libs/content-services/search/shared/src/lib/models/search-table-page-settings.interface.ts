import { ContezzaDynamicSource } from '@contezza/core/extensions';

import { PreferencesType, SearchTableLayoutSettings } from './search-table-layout-settings.interface';

export interface SearchTablePageSettings extends SearchTableLayoutSettings {
    /**
     * List of table data types to be saved as query parameters.
     */
    queryParams?: PreferencesType[];
    /**
     * List of query parameters defined by an extern source. If they are not listed here, then they are deleted. Typical use case is a redirect url.
     */
    otherQueryParams?: string[];
    currentFolder?: ContezzaDynamicSource;
}
