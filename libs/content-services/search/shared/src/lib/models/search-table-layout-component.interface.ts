import { Observable } from 'rxjs';

import { ContezzaDynamicSearchForm } from '@contezza/dynamic-forms/shared';

import { Column } from '@contezza/content-services/shared';
import { Results } from '@contezza/content-services/components/table/shared';

import { ExtendedSearchTableLayoutSettings, TableLayoutSettings } from './search-table-layout-settings.interface';

export interface TableLayoutComponent<ItemType> extends TableLayoutSettings {
    columns$: Observable<Column[]>;
    loading$: Observable<boolean>;
    results$: Observable<Results<ItemType>>;
    selection$: Observable<ItemType[]>;
}

export interface SearchTableLayoutComponent<ItemType> extends TableLayoutComponent<ItemType>, ExtendedSearchTableLayoutSettings {
    headerForm?: ContezzaDynamicSearchForm;
    columnForm?: ContezzaDynamicSearchForm;
    sidebarForm?: ContezzaDynamicSearchForm;
}
