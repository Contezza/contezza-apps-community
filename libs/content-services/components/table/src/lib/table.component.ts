import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    HostBinding,
    Input,
    Optional,
    Output,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

import { TranslateModule } from '@ngx-translate/core';

import { BehaviorSubject, combineLatest, Observable, OperatorFunction, ReplaySubject, Subject } from 'rxjs';
import { buffer, debounceTime, distinctUntilChanged, filter, map, mapTo, scan, takeUntil } from 'rxjs/operators';

import { ContezzaSelectableDirective, SelectionStore } from '@contezza/core/context';
import { ContezzaLetDirective } from '@contezza/core/directives';
import { TranslatePropertyTitlePipe } from '@contezza/core/property-titles';
import { DestroyService } from '@contezza/core/services';
import { ArrayUtils, ContezzaObservables, ContezzaUtils } from '@contezza/core/utils';
import { ResponsiveService } from '@contezza/core/responsive';
import { ContezzaDynamicFormFieldModule } from '@contezza/dynamic-forms';

import { Column } from '@contezza/content-services/shared';
import { PaginationMode, Results, SelectionMode } from '@contezza/content-services/components/table/shared';

import { ContezzaResizableModule } from './resizable/resizable.module';
import { TableCellComponent } from './table-cell.component';
import { TableRowDirective } from './table-row.directive';

// move to libs repo
// source: https://stackblitz.com/edit/rxjs6-buffer-debounce?file=index.ts
type BufferDebounce = <T>(debounce: number) => OperatorFunction<T, T[]>;
const bufferDebounce: BufferDebounce = (debounce) => (source) =>
    new Observable((observer) =>
        source.pipe(buffer(source.pipe(debounceTime(debounce)))).subscribe({
            next: (x) => observer.next(x),
            error: (err) => observer.error(err),
            complete: () => observer.complete(),
        })
    );

@Component({
    standalone: true,
    imports: [
        CommonModule,
        MatCheckboxModule,
        MatPaginatorModule,
        MatProgressSpinnerModule,
        MatSortModule,
        MatTableModule,
        TranslateModule,
        ContezzaLetDirective,
        ContezzaSelectableDirective,
        ContezzaDynamicFormFieldModule,
        TranslatePropertyTitlePipe,
        ContezzaResizableModule,
        TableCellComponent,
        TableRowDirective,
    ],
    selector: 'contezza-table',
    templateUrl: './table.component.html',
    styleUrls: ['./table.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [ContezzaUtils.ifnProvide(SelectionStore), DestroyService],
})
export class TableComponent<ItemType> implements AfterViewInit {
    @Input()
    set results(results: Results<ItemType>) {
        if (results) {
            const { list, sorting, paging } = results;

            this.dataSource = new MatTableDataSource(list);

            this.totalSelected$ = this.selection.selection$.pipe(
                debounceTime(0),
                map((selected) => selected.length)
            );

            // if `selectionMode = SelectionMode.MULTI_PAGE` then equals the total items given by the `paging` object
            this.fullSelectionLength = this.selectionMode === SelectionMode.MULTI_PAGE ? paging?.length : this.dataSource?.data.length;

            this.sortingState = sorting;

            delete this.pagingState;
            this.cd.detectChanges();
            this.pagingState = paging;

            // loading prevents multiple calls
            let loading = false;
            const observer = new IntersectionObserver(
                (entries) => {
                    // isIntersecting is true when element and viewport are overlapping
                    // isIntersecting is false when element and viewport don't overlap
                    if (!loading && entries[0].isIntersecting === true) {
                        loading = true;
                        this.paging.next({ ...this.pagingState, pageIndex: this.pagingState.pageIndex + 1 });
                    }
                },
                { threshold: [0] }
            );
            observer.observe(this.paginationSpinner.nativeElement);
        }
    }

    fullSelectionLength: number;

    sortingState: Sort;
    pagingState: PageEvent;

    dataSource: MatTableDataSource<ItemType>;
    totalSelected$: Observable<number>;

    @Input()
    set columns(value: Column[]) {
        if (value) {
            this._columns = value;
            this.displayedColumns = value.filter(({ hidden }) => !hidden).map(({ id }) => id);
        }
    }
    get columns(): Column[] {
        return this._columns;
    }
    private _columns: Column[];

    displayedColumns: string[] = [];

    @Input()
    selectionMode: SelectionMode = SelectionMode.SINGLE_PAGE;

    @Input()
    set paginationStrategy(paginationStrategy: PaginationMode) {
        this.paginationStrategySource.next(paginationStrategy);
    }
    private readonly paginationStrategySource = new BehaviorSubject<PaginationMode>(undefined);
    readonly paginationStrategy$ = this.paginationStrategySource.asObservable();

    @Output()
    readonly sorting = new EventEmitter<Sort>();

    @Output()
    readonly paging = new EventEmitter<PageEvent>();

    @Output()
    readonly selectAll = new EventEmitter<void>();

    // using touchmove events to detect overscroll behaviour
    private readonly touchmoveSource = new Subject<{ event: TouchEvent; scrollTop: number }>();
    @Output()
    topOverscroll: Observable<void> = this.touchmoveSource.asObservable().pipe(
        // events with less than 200ms interval are grouped together
        bufferDebounce(200),
        // emit if:
        filter(
            (events) =>
                // the container was at its top by each touch
                events.every(({ scrollTop }) => scrollTop === 0) &&
                // touch was long enough to generate at least two events
                events.length >= 2 &&
                // each touch point is below the previous touch point
                events.map(({ event }) => event.touches[0].pageY).every((y, index, array) => index === 0 || y > array[index - 1])
        ),
        mapTo(void 0)
    );

    @Output()
    readonly rowClick = new EventEmitter<MouseEvent>();

    @Output()
    readonly rowDblClick = new EventEmitter<MouseEvent>();

    @Output()
    readonly rowRightClick = new EventEmitter<MouseEvent>();

    @Output()
    readonly columnResized = new EventEmitter<Partial<Column>>();

    readonly resizedColumns$: Observable<string[]> = this.columnResized.asObservable().pipe(
        scan((acc, { id }) => {
            if (!acc.includes(id)) {
                acc.push(id);
            }
            return acc;
        }, []),
        distinctUntilChanged((oldValue, newValue) => oldValue.length === newValue.length)
    );

    private readonly resizingSource = new BehaviorSubject<Column | undefined>(undefined);
    readonly resizing$ = this.resizingSource.asObservable();

    private readonly afterViewInit$ = new ReplaySubject<void>(1);
    private readonly contentInit$ = new ReplaySubject<void>(1);

    @ViewChild('paginationSpinner', { read: ElementRef })
    paginationSpinner: ElementRef;

    @HostBinding('class.mobile')
    isMobile = false;

    constructor(
        element: ElementRef<HTMLElement>,
        private readonly cd: ChangeDetectorRef,
        @Optional() responsive: ResponsiveService,
        private readonly selection: SelectionStore<ItemType>,
        destroy$: DestroyService
    ) {
        responsive?.isMobile$.pipe(takeUntil(destroy$)).subscribe((value) => (this.isMobile = value));
        // resize columns with class contezza-table-cell-n, based on a percentage of the host width
        combineLatest([this.afterViewInit$, this.contentInit$, ContezzaObservables.fromCallbackable((callback) => new ResizeObserver(callback).observe(element.nativeElement))])
            .pipe(debounceTime(0), takeUntil(destroy$))
            .subscribe(() => {
                // recompute table width
                const tableWidth = element.nativeElement.clientWidth;
                // allow percentages: 0%, 5%, 10%, 15%, ..., 100%
                ArrayUtils.range(0, 101, 5).forEach((n) => {
                    const list = element.nativeElement.querySelectorAll(`.mat-header-cell:not(.contezza-resized).contezza-table-cell-${n}`);
                    if (list.length) {
                        // solving: width + padding = n% tableWidth
                        // max with 0 to prevent negative values
                        const width = Math.max((tableWidth * n) / 100 - 2 * 10, 0);
                        for (const el of list) {
                            el['style']['width'] = `${width}px`;
                            el['style']['min-width'] = `${width}px`;
                        }
                    }
                });
            });
    }

    onTouchmove(event: TouchEvent, { scrollTop }: HTMLElement) {
        this.touchmoveSource.next({ event, scrollTop });
    }

    ngAfterViewInit() {
        this.afterViewInit$.next();
        this.afterViewInit$.complete();
    }

    onContentChanged() {
        this.contentInit$.next();
        this.contentInit$.complete();
    }

    onSelectAll(checked: boolean) {
        if (checked) {
            this.selectAll.next();
        } else {
            this.selection.reset();
        }
    }

    onSortChange(event: Sort) {
        this.sorting.next(event);
    }

    onPageChange(event: PageEvent) {
        this.paging.next(event);
    }

    onRowClick(event: MouseEvent) {
        this.rowClick.next(event);
    }

    onRowDblClick(event: MouseEvent) {
        this.rowDblClick.next(event);
    }

    onRowRightClick(event: MouseEvent) {
        this.rowRightClick.next(event);
    }

    trackById(_, { id }: Column) {
        return id;
    }

    onResizing(column: Column, resizing: boolean) {
        this.resizingSource.next(resizing ? column : undefined);
    }

    onResized({ id }: Column, width: number) {
        this.columnResized.next({ id, width });
    }
}
