import { AfterViewInit, ChangeDetectionStrategy, Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';

import { combineLatest, Observable } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';

import { SelectionStore } from '@contezza/core/context';
import { Column, DynamicFormItem, DynamicFormItemGroup } from '@contezza/dynamic-forms/shared';

export enum Mode {
    Expanded = 'expanded',
    Collapsed = 'collapsed',
}

@Component({
    selector: 'contezza-selector',
    templateUrl: './selector.component.html',
    styleUrls: ['./selector.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectorComponent implements OnInit, AfterViewInit {
    @Input()
    set group(value: DynamicFormItemGroup) {
        this.title = value.title;
        if ('showHeader' in value) {
            this.showHeader = value.showHeader;
        }
        this.columns = value.columns;
        this.dataSource = new MatTableDataSource(value.items);
    }

    dataSource: MatTableDataSource<DynamicFormItem>;
    dataSource$: Observable<MatTableDataSource<DynamicFormItem>>;

    @Input()
    columns: Column[];
    displayedColumns: Record<Mode, string[]>;

    @Input()
    expanded = false;

    showHeader = true;
    title?: string;

    @ViewChild(MatSort)
    sort: MatSort;

    selected$ = this.selection.selected$;
    totalSelected$: Observable<number>;

    constructor(readonly selection: SelectionStore<DynamicFormItem>) {}

    ngOnInit() {
        this.totalSelected$ = combineLatest(this.dataSource.data.map((file) => this.selection.selected$(file))).pipe(
            debounceTime(0),
            map((selected) => selected.filter(Boolean).length)
        );

        const expanded: string[] = [];
        const collapsed: string[] = [];
        this.columns.forEach((column) => {
            if (column.expandedOnly) {
                expanded.push(column.key);
            } else if (column.collapsedOnly) {
                collapsed.push(column.key);
            } else {
                expanded.push(column.key);
                collapsed.push(column.key);
            }
        });
        this.displayedColumns = { expanded, collapsed };
    }

    ngAfterViewInit() {
        this.dataSource.sort = this.sort;
    }

    onSelectAll(checked: boolean) {
        if (checked) {
            this.selection.add(this.dataSource.data);
        } else {
            this.selection.remove(this.dataSource.data);
        }
    }
}
