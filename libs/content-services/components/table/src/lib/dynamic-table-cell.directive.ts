import { Directive, Input, OnInit } from '@angular/core';

import { Node } from '@alfresco/js-api';
import { ContentService, ShareDataRow } from '@alfresco/adf-content-services';
import { DynamicExtensionComponent } from '@alfresco/adf-extensions';

import { TableCellComponent } from './table-cell.component';

@Directive({
    standalone: true,
    // eslint-disable-next-line @angular-eslint/directive-selector
    selector: 'adf-dynamic-component[contezza-dynamic-table-cell]',
})
export class DynamicTableCellDirective<ItemType> implements OnInit {
    @Input()
    data: TableCellComponent<ItemType>;

    constructor(private readonly contentService: ContentService, private readonly component: DynamicExtensionComponent) {}

    ngOnInit() {
        this.component['componentRef'].instance.key = 'key' in this.data.column ? this.data.column.key : undefined;
        this.component['componentRef'].instance.context = {
            row: new ShareDataRow({ entry: this.data.item as any as Node }, this.contentService, undefined),
            col: this.data.column,
            data: {},
        };

        // integrating Alfresco's column templates
        const nativeElement: HTMLElement = this.component['componentRef'].location?.nativeElement;
        if (nativeElement) {
            // converts alfresco name-click into standard dblclick
            nativeElement.addEventListener('name-click', () => nativeElement.dispatchEvent(new MouseEvent('dblclick', { bubbles: true })));
            // prevents click event on app.columns.libraryName from incorrectly propagating
            if (nativeElement.tagName === 'ADF-LIBRARY-NAME-COLUMN') {
                nativeElement.addEventListener('click', (event) => event.stopPropagation());
            }
        }
    }
}
