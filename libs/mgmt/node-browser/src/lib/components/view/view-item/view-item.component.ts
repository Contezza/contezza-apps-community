import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, ViewEncapsulation } from '@angular/core';

import { ExtensionService } from '@alfresco/adf-extensions';

import { NodeBrowserViewItem, NodeBrowserViewResponse } from '../../../interfaces/node-browser-view';
import { ColumnInfo } from '../../../interfaces/column-info';

@Component({
    selector: 'node-browser-view-item',
    templateUrl: './view-item.component.html',
    styleUrls: ['./view-item.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NodeBrowserViewItemComponent {
    readonly columns: Record<string, Array<ColumnInfo>> = this.extensions.getFeature('columns')?.find(({ id }) => id === 'mgmt.node-browser.columns.browse') || {};
    _item: NodeBrowserViewItem;

    @Input()
    set item(value: NodeBrowserViewItem) {
        if (value) {
            this._item = { ...value };
        }
    }

    @Input()
    data: NodeBrowserViewResponse;

    constructor(private readonly extensions: ExtensionService, private readonly cd: ChangeDetectorRef) {}

    toggleExpansionPanel(expanded: boolean) {
        this._item.expanded = expanded;
        this.cd.detectChanges();
    }
}
