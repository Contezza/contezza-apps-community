import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialTableColumnData } from '../interfaces/table';

import { NodeBrowserColumnPropertyPipe } from '../pipes/column-property.pipe';

@Component({
    selector: 'node-browser-values-column',
    standalone: true,
    imports: [CommonModule, NodeBrowserColumnPropertyPipe],
    template: `
        <span role="link" [ngClass]="data?.class" title="{{ getValues(data?.element | columnProperty : data.key) }}">
            {{ getValues(data?.element | columnProperty : data.key) }}
        </span>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class NodeBrowserValuesColumnComponent {
    @Input()
    data: MaterialTableColumnData;

    getValues(values): string {
        return values.map((item) => item.value);
    }
}
