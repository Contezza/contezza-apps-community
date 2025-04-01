import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslateModule } from '@ngx-translate/core';

import { map, Observable } from 'rxjs';

import { IconModule } from '@alfresco/adf-core';

import { ColumnEditorComponent } from '@contezza/content-services/components/column-editor';
import { ActionComponent, Column, ColumnsStore } from '@contezza/content-services/shared';

@Component({
    standalone: true,
    imports: [CommonModule, TranslateModule, IconModule, ColumnEditorComponent],
    selector: 'contezza-column-sorter-button',
    template: `<ng-container *ngIf="columns$ | async as columns">
        <contezza-column-editor [columnsInfo]="columns" (columnsInfoChange)="updateColumns(columns)">
            <adf-icon [value]="data.icon"></adf-icon>
            {{ data.title | translate }}
        </contezza-column-editor>
    </ng-container>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColumnEditorActionComponent extends ActionComponent {
    readonly columns$: Observable<Column[]> = this.columns.columns$.pipe(map((columns) => columns.filter((column) => column.editable !== false)));

    constructor(private readonly columns: ColumnsStore) {
        super();
    }

    updateColumns(columns: Column[]) {
        this.columns.update(columns.map((column, order) => ({ id: column.id, hidden: column.hidden, order })));
    }
}
