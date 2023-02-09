import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';

import { MaterialTableColumnData } from '@contezza/material-table';

@Component({
    selector: 'node-browser-search-parent-column',
    template: `
        <span [ngClass]="data?.class" title="{{ data?.element?.qnamePath?.prefixedName | parentPath }}">
            {{ data?.element?.qnamePath?.prefixedName | parentPath }}
        </span>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class NodeBrowserSearchParentColumnComponent {
    @Input()
    data: MaterialTableColumnData;
}
