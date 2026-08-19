import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';

export interface Results<ItemType> {
    list: ItemType[];
    sorting?: Sort;
    paging?: PageEvent;
}
