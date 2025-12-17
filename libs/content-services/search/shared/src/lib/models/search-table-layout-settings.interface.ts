import { SearchRequest } from '@alfresco/js-api';
import { ExtensionElement } from '@alfresco/adf-extensions';

import { ContezzaDynamicSource } from '@contezza/core/extensions';
import { LayoutItem } from '@contezza/core/components/page-layout-content';
import { SelectionMode } from '@contezza/content-services/components/table/shared';
import { SearchParameters } from './search-parameters';

import { SidebarState } from '@contezza/content-services/shared';

import { QueryMode } from '@contezza/dynamic-forms/shared';

export interface FormSettings {
    formId: string;
    layoutId?: string;
    extras?: {
        queryMode?: QueryMode;
    };
}

export enum PreferencesType {
    Columns = 'columns',
    Sorting = 'sorting',
    MaxItems = 'maxItems',
    SkipCount = 'skipCount',
    HeaderFilters = 'header-filters',
    ColumnFilters = 'column-filters',
    SidebarFilters = 'sidebar-filters',
    LeftSidebarFilters = 'left-sidebar-filters',
}

export interface TableLayoutSettings {
    id?: string;
    title: string;
    showWidgetHeader: boolean;
    showBreadcrumb?: boolean;
    breadcrumbTitle?: string | ContezzaDynamicSource;
    breadcrumbRootFolderRule?: string;
    resultsComponent?: { id: string; data?: any };
    resultPreviewComponent?: { id: string; data?: any };
    columnsId: string;
    /**
     * Setting `selectionMode = SelectionMode.MULTI_PAGE` allows to keep the selection while paging and sorting.
     * The selection is reset by filtering and reloading.
     * Moreover, the 'select all' checkbox (if available) selects all results through all pages.
     */
    selectionMode?: SelectionMode;
    sidebarState?: SidebarState;
    actionContext?: Record<string, any>;
    preferencesId?: string;
    preferences?: PreferencesType[];
    emptyContent: EmptyContent;
    featureKeys?: { contextMenu?: string; toolbar?: string; floatingButton?: string };
    actions?: {
        [key: string]: string;
        click?: string;
        dblclick?: string;
        contextmenu?: string;
        breadcrumbNavigate?: string;
        fileUploadComplete?: string;
        onInit?: string;
    };
}

export interface SearchTableLayoutSettings extends TableLayoutSettings {
    searchStrategyId?: string;
    baseQuery?: string;
    queryTemplate?: string | Partial<SearchRequest>;
    headerFilters?: FormSettings;
    columnFilters?: FormSettings;
    sidebarFilters?: FormSettings;
    leftSidebarFilters?: FormSettings;
    default?: { sorting?: SearchParameters['sorting']; paging?: SearchParameters['paging'] };
}

export interface ExtendedSearchTableLayoutSettings extends SearchTableLayoutSettings {
    headerFiltersId?: string;
    columnFiltersId?: string;
    sidebarFiltersId?: string;
    leftSidebarFiltersId?: string;
}

export type EmptyContent = { icon: string; title: string; subtitle?: string } | ExtendedLayoutItem[];
export type ExtendedLayoutItem = LayoutItem & Partial<ExtensionElement> & { rules?: { visible?: string } };
