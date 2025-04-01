import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';

import { Observable } from 'rxjs';

import { Column } from '@contezza/content-services/shared';
import { Results, SelectionMode } from '@contezza/content-services/components/table/shared';

import { ExtendedLayoutItem } from './search-table-layout-settings.interface';

export interface ISearchResultsView<TItem> {
    results: Results<TItem>;
    columns: Column[];
    selectionMode?: SelectionMode;
    emptyContentLayoutItems: ExtendedLayoutItem[];
    sorting?: Observable<Sort>;
    paging?: Observable<PageEvent>;
    selectAll?: Observable<void>;
    mouseEvent?: Observable<MouseEvent>;
    columnResized?: Observable<Partial<Column>>;
    topOverscroll?: Observable<void>;
}
