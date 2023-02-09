import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';

import { MaterialTableColumnData } from '@contezza/material-table';

@Component({
    selector: 'node-browser-text-column',
    template: `
        <span role="link" [ngClass]="data?.class" title="{{ data?.element | columnProperty: data.key }}">
            {{ data?.element | columnProperty: data.key }}
        </span>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class NodeBrowserTextColumnComponent {
    @Input()
    data: MaterialTableColumnData;
}
