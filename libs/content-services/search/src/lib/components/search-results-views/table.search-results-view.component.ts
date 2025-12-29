import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, HostBinding, Optional, Output } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';

import { ReplaySubject, takeUntil } from 'rxjs';

import { TableComponent } from '@contezza/content-services/components/table';
import { PaginatorSettings, Results, SelectionMode } from '@contezza/content-services/components/table/shared';
import { ExtendedLayoutItem } from '@contezza/content-services/search/shared';
import { Column } from '@contezza/content-services/shared';
import { ContezzaPageLayoutContentComponent } from '@contezza/core/components/page-layout-content';
import { ResponsiveService } from '@contezza/core/responsive';
import { DestroyService } from '@contezza/core/services';

@Component({
    standalone: true,
    imports: [CommonModule, ContezzaPageLayoutContentComponent, TableComponent],
    selector: 'contezza-table-search-results-view',
    template: `<contezza-table
        style="height:100%"
        [results]="results$ | async"
        [columns]="columns$ | async"
        [selectionMode]="selectionMode"
        [paginatorSettings]="paginatorSettings"
        [paginationStrategy]="$any(isMobile ? 'scroll' : 'browse')"
        (sorting)="sorting.next($event)"
        (paging)="paging.next($event)"
        (selectAll)="selectAll.next()"
        (topOverscroll)="topOverscroll.next()"
        (rowClick)="mouseEvent.next($event)"
        (rowDblClick)="mouseEvent.next($event)"
        (rowRightClick)="mouseEvent.next($event)"
        (columnResized)="columnResized.next($event)"
    >
        <contezza-page-layout-content table-empty [items]="emptyContentLayoutItems$ | async" />
    </contezza-table>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [DestroyService],
})
export class TableSearchResultsViewComponent<TItem> {
    set results(results: Results<TItem>) {
        this.resultsSource.next(results);
    }
    private readonly resultsSource = new ReplaySubject<Results<TItem>>(1);
    readonly results$ = this.resultsSource.asObservable();

    set columns(columns: Column[]) {
        this.columnsSource.next(columns);
    }
    private readonly columnsSource = new ReplaySubject<Column[]>(1);
    readonly columns$ = this.columnsSource.asObservable();

    readonly selectionMode?: SelectionMode;

    set emptyContentLayoutItems(emptyContentLayoutItems: ExtendedLayoutItem[]) {
        this.emptyContentLayoutItemsSource.next(emptyContentLayoutItems);
    }
    private readonly emptyContentLayoutItemsSource = new ReplaySubject<ExtendedLayoutItem[]>(1);
    readonly emptyContentLayoutItems$ = this.emptyContentLayoutItemsSource.asObservable();

    // dynamic-component data
    paginatorSettings?: Partial<PaginatorSettings>;

    @Output()
    readonly sorting = new EventEmitter<Sort>();

    @Output()
    readonly paging = new EventEmitter<PageEvent>();

    @Output()
    readonly selectAll = new EventEmitter<void>();

    @Output()
    readonly mouseEvent = new EventEmitter<MouseEvent>();

    @Output()
    readonly columnResized = new EventEmitter<Partial<Column>>();

    @Output()
    readonly topOverscroll = new EventEmitter<void>();

    @HostBinding('class.mobile')
    isMobile = false;

    constructor(destroy$: DestroyService, @Optional() responsive?: ResponsiveService) {
        responsive?.isMobile$.pipe(takeUntil(destroy$)).subscribe(value => (this.isMobile = value));
    }
}
