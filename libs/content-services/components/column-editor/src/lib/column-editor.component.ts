import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

import { TranslateModule } from '@ngx-translate/core';

import { ContezzaLetDirective } from '@contezza/core/directives';
import { TranslatePropertyTitlePipe } from '@contezza/core/property-titles';
import { provideComponentTranslations } from '@contezza/core/translate';

import { Column } from '@contezza/content-services/shared';

import { i18n, TRANSLATIONS } from './i18n';

@Component({
    standalone: true,
    imports: [
        CommonModule,
        DragDropModule,
        MatButtonModule,
        MatCardModule,
        MatCheckboxModule,
        MatIconModule,
        MatMenuModule,
        TranslateModule,
        TranslatePropertyTitlePipe,
        ContezzaLetDirective,
    ],
    selector: 'contezza-column-editor',
    templateUrl: './column-editor.component.html',
    styleUrls: ['./column-editor.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [provideComponentTranslations(i18n)],
})
export class ColumnEditorComponent implements AfterViewInit {
    readonly TRANSLATIONS = TRANSLATIONS.CONTEZZA.CONTENT_SERVICES.COLUMN_EDITOR;

    @Input()
    columnsInfo: Array<Column>;

    @Output()
    columnsInfoChange = new EventEmitter<any>();

    allSelected: boolean;
    someSelected: boolean;

    constructor(private readonly elementRef: ElementRef) {}

    ngAfterViewInit(): void {
        this.elementRef.nativeElement.classList += 'contezza-mat-button-no-input';
    }

    refreshSelectAllState() {
        this.allSelected = this.columnsInfo.every(column => !column.hidden);
        this.someSelected = !this.allSelected && this.columnsInfo.some(column => !column.hidden);
    }

    columnMenuDropped(event: CdkDragDrop<any>): void {
        moveItemInArray(this.columnsInfo, event.item.data.columnIndex, event.currentIndex);
        this.emitColumns();
    }

    toggleSelectedColumn(columnName: string) {
        const colFound = this.columnsInfo.find((col: Column) => col.id === columnName);
        colFound.hidden = !colFound.hidden;
        this.emitColumns();
    }

    selectAllColumns(columns, event) {
        columns.forEach(column => (column.hidden = !event.checked));
        this.emitColumns();
    }

    trackByKey(_: number, obj: Column): string {
        return obj.key;
    }

    private emitColumns() {
        this.refreshSelectAllState();
        window.requestAnimationFrame(() => {
            this.columnsInfoChange.emit(true);
        });
    }
}
