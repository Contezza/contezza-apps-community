import { ChangeDetectionStrategy, Component, HostBinding, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PipeModule } from '@alfresco/adf-core';
import { DocumentListPresetRef } from '@alfresco/adf-extensions';

import { TableCellService } from './table-cell.service';
import { ToolbarComponent } from '../toolbar/toolbar.component';

@Component({
    standalone: true,
    imports: [CommonModule, PipeModule, ToolbarComponent],
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'td[contezza-table-cell]',
    template: `
        <ng-container *ngIf="!column.template" [ngSwitch]="column.type">
            <ng-container *ngSwitchCase="'actions'"><contezza-toolbar [target]="$any(item)"></contezza-toolbar></ng-container>
            <ng-container *ngSwitchCase="'date'">{{ value | date: 'dd-MM-yyyy' }}</ng-container>
            <ng-container *ngSwitchCase="'fileSize'">{{ value | adfFileSize }}</ng-container>
            <ng-container *ngSwitchCase="'thumbnail'"><img [src]="value | adfMimeTypeIcon" alt="" style="vertical-align: middle" /></ng-container>
            <ng-container *ngSwitchCase="'timeAgo'">{{ value | adfTimeAgo }}</ng-container>
            <ng-container *ngSwitchDefault>{{ value }}</ng-container>
        </ng-container>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableCellComponent<ItemType> implements OnInit {
    @Input()
    item: ItemType;

    @Input()
    column: DocumentListPresetRef;

    @HostBinding('class')
    hostClass: string;

    @HostBinding('title')
    hostTitle: string;

    value;

    constructor(private readonly service: TableCellService<ItemType>) {}

    ngOnInit() {
        this.hostClass = this.column.class;
        this.value = this.service.getValue(this.item, this.column.key);
        this.hostTitle = this.tooltip;
    }

    private get tooltip(): string {
        switch (this.column.type) {
            case 'date':
            case 'template':
            case 'fileSize':
            case 'timeAgo':
                return '';
            default:
                return this.value;
        }
    }
}
