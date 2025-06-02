import { Injectable } from '@angular/core';

export interface TableRowServiceInterface<ItemType> {
    process: (row: { item: ItemType; row: HTMLTableRowElement }) => void;
}

@Injectable()
export abstract class TableRowService<ItemType> implements TableRowServiceInterface<ItemType> {
    abstract process: (row: { item: ItemType; row: HTMLTableRowElement }) => void;
}
