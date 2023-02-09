import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChildren, Inject, Input, OnInit, QueryList, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatColumnDef, MatTable, MatTableDataSource } from '@angular/material/table';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

import { takeUntil } from 'rxjs/operators';

import { ColumnInfo, DestroyService } from '@contezza/utils';
import { MaterialTableEmptyContent } from '@contezza/material-table';

@Component({
    selector: 'node-browser-result-table',
    templateUrl: './result-table.component.html',
    styleUrls: ['./result-table.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: 'nb-result-table' },
    providers: [DestroyService],
})
export class NodeBrowserResultTableComponent<T> implements OnInit {
    isSmallScreen: boolean;
    _dataSource: MatTableDataSource<T>;
    extraColumns: Array<string> = [];

    private matTable: MatTable<T>;

    @Input()
    set dataSource(source: any) {
        if (source) {
            this._dataSource = new MatTableDataSource([...source]);
        }
    }

    @Input()
    columns: Array<ColumnInfo>;

    @Input()
    errorMessage: string;

    @Input()
    emptyContent: MaterialTableEmptyContent;

    @ViewChild(MatTable)
    set setTable(table: MatTable<T>) {
        if (!!table) {
            this.matTable = table;
        }
    }

    @ContentChildren(MatColumnDef)
    set columnsDefs(columns: QueryList<MatColumnDef>) {
        columns.forEach((columnDef) => {
            this.matTable.addColumnDef(columnDef);
            this.extraColumns.push(columnDef.name);
        });
    }

    constructor(private readonly cd: ChangeDetectorRef, private readonly breakpointObserver: BreakpointObserver, @Inject(DestroyService) readonly destroy$) {}

    get displayedColumns(): Array<string> {
        return [...this.columns?.filter((cd) => !this.isSmallScreen || cd.onSmallScreen).map((cd) => cd.name), ...(this.extraColumns ?? [])];
    }

    ngOnInit(): void {
        this.breakpointObserver
            .observe([Breakpoints.HandsetPortrait, Breakpoints.HandsetLandscape, Breakpoints.Small])
            .pipe(takeUntil(this.destroy$))
            .subscribe((result) => {
                this.isSmallScreen = result.matches;
                this.cd.detectChanges();
            });
    }

    trackByName(_: number, item: ColumnInfo) {
        return item.name;
    }
}
