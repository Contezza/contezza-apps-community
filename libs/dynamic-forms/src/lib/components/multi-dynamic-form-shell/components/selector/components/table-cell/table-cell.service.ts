import { Injectable } from '@angular/core';

import { ContezzaObjectUtils } from '@contezza/core/utils';

export interface TableCellServiceInterface<ItemType> {
    getValue: (item: ItemType, key: string) => any;
}

@Injectable({
    providedIn: 'root',
})
export class TableCellService<ItemType> implements TableCellServiceInterface<ItemType> {
    getValue(item: ItemType, key: string) {
        return ContezzaObjectUtils.getValue(item, key);
    }
}
