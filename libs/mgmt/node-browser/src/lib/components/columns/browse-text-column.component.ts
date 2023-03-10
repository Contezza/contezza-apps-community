import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialTableColumnData } from '../../interfaces/table';

import { NodeBrowserColumnPropertyPipe } from '../../pipes/column-property.pipe';

@Component({
    selector: 'node-browser-text-column',
    standalone: true,
    imports: [CommonModule, NodeBrowserColumnPropertyPipe],
    template: `
        <span role="link" [ngClass]="data?.class" title="{{ data?.element | columnProperty : data.key }}">
            {{ data?.element | columnProperty : data.key }}
        </span>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class NodeBrowserTextColumnComponent {
    @Input()
    data: MaterialTableColumnData;
}
