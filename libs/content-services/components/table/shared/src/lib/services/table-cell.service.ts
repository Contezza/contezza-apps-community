import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { Column, FormatterService } from '@contezza/content-services/shared';

export interface TableCellServiceInterface<ItemType> {
    getValue: (item: ItemType, column: Column) => Observable<string>;
}

@Injectable({
    providedIn: 'root',
})
export class TableCellService<ItemType> implements TableCellServiceInterface<ItemType> {
    constructor(private readonly formatter: FormatterService) {}

    getValue(item: ItemType, column: Column) {
        return this.formatter.getStringifiedValue(item, column);
    }
}
