import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';

import { Store } from '@ngrx/store';
import { CommonModule } from '@angular/common';

import { MaterialTableColumnData } from '../../interfaces/table';

import { nodeBrowse } from '../../store/actions';
import { NodeBrowserColumnPropertyPipe } from '../../pipes/column-property.pipe';

@Component({
    selector: 'node-browser-search-link-column',
    standalone: true,
    imports: [CommonModule, NodeBrowserColumnPropertyPipe],
    template: `
        <span role="link" [ngClass]="data?.class" title="{{ data?.element | columnProperty : data.key }}" (click)="onClick()">
            {{ data?.element | columnProperty : data.key }}
        </span>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class NodeBrowserSearchLinkColumnComponent {
    @Input()
    data: MaterialTableColumnData;

    constructor(private readonly store: Store<unknown>) {}

    onClick() {
        this.store.dispatch(nodeBrowse({ nodeRef: this.data.element.nodeRef }));
    }
}
