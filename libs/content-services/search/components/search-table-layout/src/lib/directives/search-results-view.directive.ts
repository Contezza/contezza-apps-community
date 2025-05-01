import { Directive, Input, Output } from '@angular/core';

import { filter, map, Observable, pipe, switchMap } from 'rxjs';

import { DynamicComponent } from '@contezza/core/dynamic-component';
import { PickByType } from '@contezza/core/utils';
import { Column } from '@contezza/content-services/shared';
import { Results, SelectionMode } from '@contezza/content-services/components/table/shared';
import { ExtendedLayoutItem, ISearchResultsView } from '@contezza/content-services/search/shared';

@Directive({
    standalone: true,
    // eslint-disable-next-line @angular-eslint/directive-selector
    selector: 'contezza-dynamic-component[contezza-search-results-view]',
})
export class SearchResultsViewDirective<TItem> implements ISearchResultsView<TItem> {
    private readonly componentReady$: Observable<ISearchResultsView<TItem>> = this.host.componentReady$;

    @Input()
    set results(results: Results<TItem>) {
        this.componentReady$.subscribe((component) => (component.results = results));
    }

    @Input()
    set columns(columns: Column[]) {
        this.componentReady$.subscribe((component) => (component.columns = columns));
    }

    @Input()
    set selectionMode(selectionMode: SelectionMode) {
        this.componentReady$.subscribe((component) => (component.selectionMode = selectionMode));
    }

    @Input()
    set emptyContentLayoutItems(emptyContentLayoutItems: ExtendedLayoutItem[]) {
        this.componentReady$.subscribe((component) => (component.emptyContentLayoutItems = emptyContentLayoutItems));
    }

    @Output()
    readonly sorting = this.componentReady$.pipe(filteredSwitchMap('sorting'));

    @Output()
    readonly paging = this.componentReady$.pipe(filteredSwitchMap('paging'));

    @Output()
    readonly selectAll = this.componentReady$.pipe(filteredSwitchMap('selectAll'));

    @Output()
    readonly mouseEvent = this.componentReady$.pipe(filteredSwitchMap('mouseEvent'));

    @Output()
    readonly columnResized = this.componentReady$.pipe(filteredSwitchMap('columnResized'));

    @Output()
    readonly topOverscroll = this.componentReady$.pipe(filteredSwitchMap('topOverscroll'));

    constructor(private readonly host: DynamicComponent<any>) {}
}

// eslint-disable-next-line
function filteredSwitchMap<TItem, TKey extends keyof PickByType<ISearchResultsView<TItem>, Observable<any>>>(key: TKey) {
    return pipe(
        map((component: ISearchResultsView<TItem>) => component[key]),
        filter(Boolean),
        switchMap((_) => _)
    );
}
