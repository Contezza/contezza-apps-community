import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialTableColumnData } from '../interfaces/table';

import { NodeBrowserColumnParentPathPipe } from '../pipes/column-parent-path.pipe';

@Component({
    selector: 'node-browser-search-parent-column',
    standalone: true,
    imports: [CommonModule, NodeBrowserColumnParentPathPipe],
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
