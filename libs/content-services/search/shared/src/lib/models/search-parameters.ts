import { Node, RequestPagination, RequestSortDefinitionInner } from '@alfresco/js-api';

export interface SearchParameters {
    baseQuery?: string;
    searchValue?: string;
    headerQuery?: string;
    columnQuery?: string;
    sidebarQuery?: string;
    filterQuery?: string;
    currentFolder?: Node;
    sorting: RequestSortDefinitionInner;
    paging: RequestPagination;
}
