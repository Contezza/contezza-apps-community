import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChildren,
    EventEmitter,
    Inject,
    Input,
    OnDestroy,
    OnInit,
    Output,
    QueryList,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatColumnDef, MatTable, MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

import { takeUntil } from 'rxjs/operators';

import { DestroyService } from '@contezza/utils';

import { ColumnInfo, MaterialTableAction, MaterialTableEmptyContent } from '../material-table-interfaces';
import { SelectionModel } from '@angular/cdk/collections';
import { Store } from '@ngrx/store';
import { NodeEntry } from '@alfresco/js-api';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ContezzaMaterialTableService } from '../material-table.service';

@Component({
    selector: 'contezza-material-table',
    templateUrl: './material-table.component.html',
    styleUrls: ['./material-table.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [DestroyService],
    animations: [
        trigger('detailExpand', [
            state('collapsed', style({ height: '0px', minHeight: '0', display: 'none' })),
            state('expanded', style({ height: '*' })),
            transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ]),
    ],
})
export class MaterialTableComponent<T> implements OnInit, OnDestroy {
    isSmallScreen: boolean;
    _dataSource: MatTableDataSource<T>;

    extraColumns: Array<string> = [];

    selection = new SelectionModel<unknown>(false, []);

    paginatorSettings: { pageSize: number } = { pageSize: 25 };

    expandedElement: any = null;

    private matTable: MatTable<T>;

    @Input()
    set dataSource(source: any) {
        if (source) {
            this._dataSource = new MatTableDataSource([...source]);
            this._dataSource.paginator = this.paginator;
        }
    }

    @Input()
    columns: Array<ColumnInfo>;

    @Input()
    actions: Array<MaterialTableAction>;

    @Input()
    loading: boolean;

    @Input()
    useSelection: boolean;

    @Input()
    showPaging = true;

    @Input()
    emptyContent: MaterialTableEmptyContent;

    @Input()
    expandedContent = false;

    @Input()
    expandedComponentId: string;

    @Output()
    // eslint-disable-next-line @angular-eslint/no-output-on-prefix
    onPageChanged = new EventEmitter<any>();

    @Output()
    rowClick = new EventEmitter<any>();

    @Output()
    selectionChange = new EventEmitter<any>();

    @Output()
    // eslint-disable-next-line @angular-eslint/no-output-on-prefix
    onActionMenuTriggert = new EventEmitter<boolean>();

    @ViewChild(MatPaginator, { static: false })
    paginator: MatPaginator;

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

    constructor(
        private readonly store: Store<unknown>,
        private readonly cd: ChangeDetectorRef,
        private readonly contezzaMaterialTableService: ContezzaMaterialTableService,
        private readonly breakpointObserver: BreakpointObserver,
        @Inject(DestroyService) readonly destroy$
    ) {}

    get displayedColumns(): Array<string> {
        return [
            ...this.columns
                .filter((cd) => !this.isSmallScreen || cd.onSmallScreen)
                .map((cd) => cd.name)
                .concat(this.actions ? ['actions'] : []),
            ...(this.extraColumns ?? []),
        ];
    }

    ngOnInit(): void {
        this.breakpointObserver
            .observe([Breakpoints.HandsetPortrait, Breakpoints.HandsetLandscape, Breakpoints.Small])
            .pipe(takeUntil(this.destroy$))
            .subscribe((result) => {
                this.isSmallScreen = result.matches;
                this.cd.detectChanges();
            });

        this.contezzaMaterialTableService.onTogglePanel$
            .pipe(takeUntil(this.destroy$))
            .subscribe((element) => (this.expandedElement = (this.expandedElement && !this.shallowEqual(this.expandedElement, element)) || !this.expandedElement ? element : null));
    }

    ngOnDestroy(): void {
        this.selection.toggle([]);
        this.clearSelection();
    }

    onPageChange($event) {
        if ($event?.pageSize) {
            this.paginatorSettings.pageSize = $event.pageSize;
            this.onPageChanged.next($event);
            this.clearSelection();
        }
    }

    setSelection(selection?: any): void {
        if (this.useSelection) {
            this.selection.toggle(selection);
            this.selectionChange.emit(this.selection.selected);

            this.store.dispatch({
                type: 'SET_SELECTED_NODES',
                payload: this.selection.hasValue()
                    ? this.selection.selected.map(
                          (item) =>
                              new NodeEntry({
                                  entry: {
                                      item,
                                      isFolder: false,
                                      isFile: false,
                                  },
                              })
                      )
                    : [],
            });
        }
        this.rowClick.emit(this.selection.selected);
    }

    private clearSelection() {
        this.store.dispatch({ type: 'SET_SELECTED_NODES', payload: [] });
    }

    getElementData(element: any, columns: Array<ColumnInfo>, actions: Array<MaterialTableAction>, dataSource: any) {
        return {
            ...{
                element,
                columns,
                actions,
                dataSource,
            },
            ...(this.expandedContent
                ? {
                      expanded: !!this.expandedElement && this.shallowEqual(this.expandedElement, element),
                  }
                : {}),
        };
    }

    private shallowEqual(object1, object2): boolean {
        const keys1 = Object.keys(object1);
        const keys2 = Object.keys(object2);
        if (keys1.length !== keys2.length) {
            return false;
        }
        for (const key of keys1) {
            if (object1[key] !== object2[key]) {
                return false;
            }
        }
        return true;
    }
}
