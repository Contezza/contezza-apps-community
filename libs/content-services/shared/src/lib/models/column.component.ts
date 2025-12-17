import { Directive, input, Input } from '@angular/core';

import { PropertyDisplay } from './property-display';

export interface IColumnComponent<TItem = unknown, TData = undefined> {
    item: TItem;
    column: PropertyDisplay & { data: TData };
}

/**
 * @deprecated Use {@link ColumnComponentV2} instead.
 */
@Directive()
export abstract class ColumnComponent<TItem = unknown, TData = undefined> implements IColumnComponent<TItem, TData> {
    @Input()
    item!: TItem;

    @Input()
    column!: PropertyDisplay & { data: TData };
}

@Directive()
export abstract class ColumnComponentV2<TItem = unknown, TData = undefined> {
    readonly item = input.required<TItem>();
    readonly column = input.required<PropertyDisplay & { data: TData }>();
}
