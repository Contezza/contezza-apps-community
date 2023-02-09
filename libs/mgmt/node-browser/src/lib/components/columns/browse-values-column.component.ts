import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';

import { MaterialTableColumnData } from '@contezza/material-table';

@Component({
    selector: 'node-browser-values-column',
    template: `
        <span role="link" [ngClass]="data?.class" title="{{ getValues(data?.element | columnProperty: data.key) }}">
            {{ getValues(data?.element | columnProperty: data.key) }}
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
