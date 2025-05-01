import { Directive, ElementRef, Input, OnInit, Optional } from '@angular/core';

import { TableRowService } from '@contezza/content-services/components/table/shared';

@Directive({
    standalone: true,
    // eslint-disable-next-line @angular-eslint/directive-selector
    selector: 'tr[contezza-table-row]',
})
export class TableRowDirective<ItemType> implements OnInit {
    @Input('contezza-table-row')
    item: ItemType;

    readonly row: HTMLTableRowElement;

    constructor(element: ElementRef<HTMLTableRowElement>, @Optional() private readonly service: TableRowService<ItemType>) {
        this.row = element.nativeElement;
    }

    ngOnInit() {
        this.service?.process(this);
    }
}
