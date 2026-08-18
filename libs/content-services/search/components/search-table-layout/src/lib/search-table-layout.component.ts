import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostBinding, Input, OnDestroy, OnInit, Optional } from '@angular/core';
import { FormControl } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Sort } from '@angular/material/sort';
import { Router } from '@angular/router';

import { Store } from '@ngrx/store';

import {
    BehaviorSubject,
    debounceTime,
    distinctUntilChanged,
    filter,
    map,
    merge,
    Observable,
    of,
    scan,
    share,
    shareReplay,
    switchMap,
    take,
    takeUntil,
    tap,
    withLatestFrom,
} from 'rxjs';

import { PageLayoutModule } from '@alfresco/aca-shared';
import { DocumentListService, UploadModule, UploadService } from '@alfresco/adf-content-services';
import { TemplateModule } from '@alfresco/adf-core';
import { GenericFacetResponse, Node, ResultSetPaging, SearchRequest } from '@alfresco/js-api';

import { InfoDrawerComponent } from '@contezza/core/components/info-drawer';
import { LayoutItemTypes } from '@contezza/core/components/page-layout-content';
import { ContextMenuService, CurrentFolderStore, FloatingButtonComponent, RuleContextService, SelectionStore, ToolbarComponent } from '@contezza/core/context';
import { ContezzaLetModule, ReloadOnChangeOfDirective } from '@contezza/core/directives';
import { DynamicComponent } from '@contezza/core/dynamic-component';
import { ContezzaLoadingObservable } from '@contezza/core/extensions';
import { ResponsiveService } from '@contezza/core/responsive';
import { DestroyService, RefreshSubject } from '@contezza/core/services';
import { ArrayUtils, ContezzaObservables } from '@contezza/core/utils';

import { PaginationMode, Results, SelectionMode } from '@contezza/content-services/components/table/shared';
import { PresetPanelComponent } from '@contezza/content-services/presets/components/preset-panel';
import { loadPreset, loadPresets, PresetType, saveNewVersion, savePreset } from '@contezza/content-services/presets/shared';
import {
    ExtendedLayoutItem,
    ExtendedSearchTableLayoutSettings,
    FormSettings,
    PagingUtils,
    PreferencesType,
    SearchParameters,
    SearchParametersStore,
    SearchResultsService,
    SearchTableLayoutComponent as SearchTableLayoutComponentInterface,
    SearchTableLayoutSettings,
    SortingUtils,
    TableLayoutSettings,
} from '@contezza/content-services/search/shared';
import { Column, ColumnsStore, SidebarContent, SidebarContentType, SidebarState, SidebarStore, ViewStore } from '@contezza/content-services/shared';
import { ContezzaDynamicFormFilterComponent, ContezzaDynamicFormModule, ContezzaDynamicSearchFormService } from '@contezza/dynamic-forms';
import { ContezzaDynamicSearchForm, DYNAMIC_FORM_DEPENDENCIES, QueryMode } from '@contezza/dynamic-forms/shared';

import { HeaderComponent } from './components';
import { SearchResultPreviewDirective } from './directives/search-result-preview.directive';
import { SearchResultsViewDirective } from './directives/search-results-view.directive';
import { PreferencesService } from './services/preferences.service';
import { CustomStoreService } from './services/store.service';

@Component({
    standalone: true,
    imports: [
        CommonModule,
        MatProgressSpinnerModule,
        TemplateModule,
        UploadModule,
        PageLayoutModule,
        InfoDrawerComponent,
        ContezzaLetModule,
        ReloadOnChangeOfDirective,
        ContezzaDynamicFormModule,
        ContezzaDynamicFormFilterComponent,
        DynamicComponent,
        SearchResultsViewDirective,
        SearchResultPreviewDirective,
        PresetPanelComponent,
        FloatingButtonComponent,
        ToolbarComponent,
        HeaderComponent,
    ],
    selector: 'contezza-search-table-layout',
    templateUrl: './search-table-layout.component.html',
    styleUrls: ['./search-table-layout.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        DestroyService,
        SelectionStore,
        CurrentFolderStore,
        RuleContextService,
        ColumnsStore,
        SearchParametersStore,
        SearchResultsService,
        PreferencesService,
        SidebarStore,
        ViewStore,
        CustomStoreService,
        { provide: Store, useExisting: CustomStoreService },
        ContextMenuService.PROVIDER,
        { provide: DYNAMIC_FORM_DEPENDENCIES, useFactory: (view: ViewStore) => ({ expanded: view.expanded$ }), deps: [ViewStore] },
    ],
})
export class SearchTableLayoutComponent implements SearchTableLayoutComponentInterface<Node>, OnInit, OnDestroy {
    @Input()
    set settings(settings: ExtendedSearchTableLayoutSettings) {
        Object.assign(this, settings);
    }

    @HostBinding('id')
    @Input()
    id?: string;

    @Input()
    title: string;

    @Input()
    showWidgetHeader = false;

    @Input()
    showMenuAction = true;

    @Input()
    showBreadcrumb = false;

    @Input()
    breadcrumbTitle?: TableLayoutSettings['breadcrumbTitle'];

    @Input()
    breadcrumbRootFolderRule?: string;

    @Input()
    resultsComponent!: { id: string; data?: any };

    @Input()
    resultPreviewComponent?: { id: string; data?: any };

    @Input()
    columnsId: string;

    @Input()
    selectionMode: SelectionMode = SelectionMode.SINGLE_PAGE;

    @Input()
    set actionContext(context: TableLayoutSettings['actionContext']) {
        this.ruleContext.next(context);
    }

    @Input()
    searchStrategyId = 'default';

    @Input()
    baseQuery?: string;

    @Input()
    queryTemplate?: string | Partial<SearchRequest>;

    @Input()
    set headerFiltersId(formId: string) {
        this.headerFilters = { formId };
    }

    @Input()
    headerFilters?: FormSettings;

    headerForm?: ContezzaDynamicSearchForm;

    @Input()
    set columnFiltersId(formId: string) {
        this.columnFilters = { formId };
    }

    @Input()
    columnFilters?: FormSettings;

    columnForm?: ContezzaDynamicSearchForm;

    @Input()
    set sidebarFiltersId(formId: string) {
        this.sidebarFilters = { formId };
    }

    @Input()
    sidebarFilters?: FormSettings;

    sidebarForm?: ContezzaDynamicSearchForm;

    @Input()
    set leftSidebarFiltersId(formId: string) {
        this.leftSidebarFilters = { formId };
    }

    @Input()
    leftSidebarFilters?: FormSettings;

    leftSidebarForm?: ContezzaDynamicSearchForm;

    @Input()
    default?: SearchTableLayoutSettings['default'];

    @Input()
    preferencesId?: string;

    @Input()
    preferences: PreferencesType[] = [
        PreferencesType.Columns,
        PreferencesType.Sorting,
        PreferencesType.MaxItems,
        PreferencesType.HeaderFilters,
        PreferencesType.ColumnFilters,
        PreferencesType.SidebarFilters,
        PreferencesType.LeftSidebarFilters,
    ];

    @Input()
    sidebarState: SidebarState = { expanded: false, hideTitle: false };

    @Input()
    leftSidebarState: SidebarState = { expanded: true, hideTitle: true };

    @Input()
    set emptyContent(value: SearchTableLayoutSettings['emptyContent']) {
        this.emptyContentLayoutItemsSource.next(
            Array.isArray(value)
                ? value
                : [{ type: LayoutItemTypes.Icon, value: value.icon }, { value: value.title, class: 'contezza-page-layout-content-title-small' }, { value: value.subtitle }],
        );
    }
    private readonly emptyContentLayoutItemsSource = new BehaviorSubject<ExtendedLayoutItem[]>(undefined);
    readonly emptyContentLayoutItems$ = this.emptyContentLayoutItemsSource.asObservable();

    @Input()
    featureKeys: TableLayoutSettings['featureKeys'] = { contextMenu: 'contextMenu', toolbar: 'toolbar', floatingButton: 'floatingButton' };

    @Input()
    actions: TableLayoutSettings['actions'] = { contextmenu: 'CONTEXT_MENU' };

    readonly columns$: Observable<Column[]> = this.columns.columns$.pipe(
        tap(columns => {
            if (this.columnForm) {
                columns
                    .filter(({ filterable }) => filterable !== false)
                    .forEach(column => {
                        const id = column.id.split('.').pop();
                        const field = this.columnForm.getFieldById(id);
                        const control = this.columnForm.getControlById(id) as FormControl;
                        if (field && control) {
                            column.filter = { field, control };
                        }
                    });
            }
        }),
    );

    /**
     * If `selectionMode = SelectionMode.MULTI_PAGE` this property allows to tell which actions trigger a selection reset (reload, filtering) and which do not (sorting, paging).
     *
     * @private
     */
    private awaitingSelectionReset = false;
    private fullSelectionSnapshot?: Node[];

    ready$: Observable<boolean>;
    readonly loading$: Observable<boolean> = this.search.searching$.pipe(
        tap(searching => {
            if (searching && (this.selectionMode !== SelectionMode.MULTI_PAGE || this.awaitingSelectionReset)) {
                this.selection.reset();
                this.awaitingSelectionReset = false;
            }
        }),
    );

    readonly searchParameters$ = this.searchParametersStore.parameters$;

    readonly results$: Observable<Results<Node>> = this.search.results$.pipe(
        filter(Boolean),
        withLatestFrom(this.searchParametersStore.sorting$),
        map(([results, sorting]) => ({
            list: results.list.entries.map(({ entry }) => entry as Node),
            sorting: SortingUtils.alfrescoToNg(sorting),
            paging: results.list.pagination && PagingUtils.alfrescoToNg(results.list.pagination),
        })),
        scan((oldResults, newResults) => {
            let newList;
            const { list, paging } = newResults;
            const paginationStrategy = this.isMobile ? PaginationMode.SCROLL : PaginationMode.BROWSE;
            if (paging && paginationStrategy === PaginationMode.SCROLL && paging.pageSize !== 0 && paging.pageIndex !== 0) {
                if (oldResults?.list.length === paging.pageSize * paging.pageIndex) {
                    newList = oldResults.list.concat(list);
                } else {
                    newList = null;
                    this.onPagingChange({ ...paging, pageIndex: 0 });
                }
            } else {
                newList = list;
            }
            return newList ? { ...newResults, list: newList } : null;
        }, null),
        filter(Boolean),
        shareReplay({ bufferSize: 1, refCount: true }),
    );
    readonly facets$: Observable<Record<string, GenericFacetResponse>> = this.search.facets$;

    readonly selection$: Observable<Node[]> = this.selection.selection$;

    readonly sidebarContent$ = this.sidebar.content$.pipe(tap(val => (this.activeSidebarClass = val && typeof val !== 'string' ? val.activeSidebarClass : undefined)));

    @Input()
    extras?: {
        currentFolder$?: ContezzaLoadingObservable<Node>;
        dependencies?: Record<string, Observable<any>>;
        browsingQueryParams$?: Observable<Partial<Pick<SearchParameters, 'sorting' | 'paging'>>>;
    };

    readonly currentFolder$ = this.currentFolderStore.state$;

    @HostBinding('class')
    activeSidebarClass?: string;

    private readonly showPreviewSource = new BehaviorSubject(false);
    readonly showPreview$ = this.showPreviewSource.asObservable();

    @HostBinding('class.mobile')
    isMobile = false;

    constructor(
        private readonly router: Router,
        private readonly store: CustomStoreService,
        private readonly appHook: DocumentListService,
        private readonly upload: UploadService,
        private readonly dynamicFormService: ContezzaDynamicSearchFormService,
        private readonly refresh$: RefreshSubject,
        private readonly currentFolderStore: CurrentFolderStore,
        private readonly ruleContext: RuleContextService<TableLayoutSettings['actionContext']>,
        private readonly searchParametersStore: SearchParametersStore,
        private readonly search: SearchResultsService,
        private readonly columns: ColumnsStore,
        private readonly preferencesService: PreferencesService,
        private readonly sidebar: SidebarStore,
        private readonly view: ViewStore,
        private readonly selection: SelectionStore<Node>,
        private readonly contextMenu: ContextMenuService,
        @Optional() responsive: ResponsiveService,
        private readonly destroy$: DestroyService,
    ) {
        store.components.push(this);
        responsive?.isMobile$.pipe(takeUntil(destroy$)).subscribe(value => (this.isMobile = value));
    }

    ngOnInit() {
        this.resultsComponent ??= { id: 'search-results-views.table' };

        if (this.extras?.currentFolder$) {
            const currentFolder$ = this.extras.currentFolder$.pipe(share());
            this.currentFolderStore.patchState(
                currentFolder$.pipe(
                    tap(({ loading }) => {
                        if (loading) {
                            this.searchParametersStore.switch(false);
                        }
                    }),
                    map(({ value }) => value),
                ),
            );
            this.searchParametersStore.patchState(
                currentFolder$.pipe(
                    filter(({ loading }) => !loading),
                    map(({ value }) => ({ currentFolder: value })),
                    tap(() => {
                        this.searchParametersStore.switch(true);
                    }),
                ),
            );
        }

        merge(this.refresh$, this.appHook.reload$)
            .pipe(
                // do not refresh in viewer mode
                filter(() => !this.router.url.includes('viewer:view')),
                debounceTime(100),
                takeUntil(this.destroy$),
            )
            .subscribe(() => this.search.reload());

        if (this.actions?.fileUploadComplete) {
            this.upload.fileUploadComplete
                .asObservable()
                .pipe(
                    withLatestFrom(this.currentFolder$),
                    filter(([event, currentFolder]) => currentFolder && event?.file?.options?.parentId === currentFolder.id),
                    debounceTime(1500),
                    takeUntil(this.destroy$),
                )
                .subscribe(([payload]) => this.store.dispatch({ type: this.actions.fileUploadComplete, payload }));
        }

        const {
            searchStrategyId,
            baseQuery,
            columnsId,
            selectionMode,
            queryTemplate,
            headerFilters,
            columnFilters,
            sidebarFilters,
            leftSidebarFilters,
            preferencesId,
            preferences,
        } = this;

        this.columns.id = columnsId;

        if (selectionMode === SelectionMode.MULTI_PAGE) {
            // check equality of selected nodes based on id property instead of object equality
            (this.selection as any)['decoder'] = {
                toNode: (item: Node): Node => item,
                areEqual: (item1: Node, item2: Node): boolean => item1.id === item2.id,
            };
        }

        if (baseQuery) {
            this.searchParametersStore.patchState({ baseQuery });
        }

        this.search.strategyId = searchStrategyId;
        if (queryTemplate) {
            this.search.queryTemplate = queryTemplate;
        }

        if (preferencesId) {
            this.preferencesService.id = preferencesId;
        }

        this.sidebar.setState(this.sidebarState);

        // correct order:
        // 1 - bind search with forms (if any)
        // 2 - load preferences and wait until they are ready
        // 3 - bind search with query params (if any), switch on search
        // 4 - load table and forms

        const loadForm = (data: {
            formSettings: FormSettings;
            preferenceType: PreferencesType;
            queryKey: Parameters<SearchParametersStore['bindQuery']>[2];
        }): ContezzaDynamicSearchForm => {
            const { formSettings, preferenceType, queryKey } = data;
            if (formSettings) {
                const form = this.dynamicFormService.get(formSettings.formId, formSettings.layoutId);
                if (formSettings.extras?.queryMode) {
                    form.queryMode = formSettings.extras.queryMode;
                    // if *at least* one form has query mode ON_TRIGGER, then the result service has query mode ON_TRIGGER
                    if (formSettings.extras.queryMode === QueryMode.ON_TRIGGER) {
                        this.search.queryMode = QueryMode.ON_TRIGGER;
                    }
                }
                if (preferencesId && preferences.includes(preferenceType)) {
                    this.preferencesService.bind(form, preferenceType.toString());
                }
                if (this.extras?.dependencies) {
                    form.provideDependencies(this.extras?.dependencies);
                }
                form.provideDependencies({ currentFolder: this.currentFolder$, facets: this.facets$ });
                form.build();
                // manage form validity
                this.searchParametersStore.bindQuery(
                    form.query.pipe(
                        // swapping filter and distinctUntilChanged looks more logic but it breaks some pages
                        filter(() => form.form.valid), // Ensure only valid queries trigger
                        distinctUntilChanged((a, b) => (form.queryMode === QueryMode.ON_TRIGGER ? false : a === b)), // Avoid redundant queries, except when results are cleared
                        tap(() => {
                            this.awaitingSelectionReset = true;
                            this.fullSelectionSnapshot = undefined;
                        }),
                    ),
                    // pass form validity as observable
                    form.valid$,
                    queryKey,
                );
                return form;
            } else {
                return undefined;
            }
        };

        this.headerForm = loadForm({ formSettings: headerFilters, preferenceType: PreferencesType.HeaderFilters, queryKey: 'headerQuery' });
        this.columnForm = loadForm({ formSettings: columnFilters, preferenceType: PreferencesType.ColumnFilters, queryKey: 'columnQuery' });
        this.sidebarForm = loadForm({ formSettings: sidebarFilters, preferenceType: PreferencesType.SidebarFilters, queryKey: 'sidebarQuery' });
        this.leftSidebarForm = loadForm({ formSettings: leftSidebarFilters, preferenceType: PreferencesType.LeftSidebarFilters, queryKey: 'leftSidebarQuery' });

        if (preferencesId && preferences.includes(PreferencesType.Columns)) {
            this.preferencesService.bind(
                {
                    next: columns => this.columns.update(columns),
                    asObservable: () => this.columns.preset$,
                    decode: value => (value ? JSON.parse(value) : []),
                    encode: value => (value ? JSON.stringify(value) : undefined),
                },
                PreferencesType.Columns.toString(),
            );
        }

        if (preferencesId && preferences.includes(PreferencesType.Sorting)) {
            this.preferencesService.bind(
                {
                    next: sorting => {
                        if (sorting) {
                            this.searchParametersStore.patchState({ sorting });
                        }
                    },
                    asObservable: () => this.searchParametersStore.sorting$,
                    decode: value => (value ? JSON.parse(value) : this.default?.sorting),
                    encode: value => (value ? JSON.stringify(value) : undefined),
                },
                PreferencesType.Sorting.toString(),
            );
        } else if (this.default?.sorting) {
            this.searchParametersStore.patchState({ sorting: this.default.sorting });
        }
        if (preferencesId && preferences.includes(PreferencesType.MaxItems)) {
            this.preferencesService.bind(
                {
                    next: paging => {
                        if (paging) {
                            this.searchParametersStore.patchState({ paging });
                        }
                    },
                    asObservable: () => this.searchParametersStore.paging$,
                    decode: value => (value ? JSON.parse(value) : this.default?.paging),
                    encode: value => (value ? JSON.stringify({ maxItems: value.maxItems }) : undefined),
                },
                PreferencesType.MaxItems.toString(),
            );
        } else if (this.default?.paging) {
            this.searchParametersStore.patchState({ paging: this.default.paging });
        }

        this.ready$ = this.preferencesService.ready$.pipe(
            tap(ready => {
                if (ready) {
                    if (this.extras?.browsingQueryParams$) {
                        this.searchParametersStore.patchState(
                            this.searchParametersStore.ready$.pipe(
                                take(1),
                                switchMap(() => this.extras.browsingQueryParams$),
                            ),
                        );
                    }
                    this.searchParametersStore.switch(true);
                }
            }),
        );

        this.contextMenu.init({ key: this.featureKeys?.contextMenu });

        // dispatch on init action(s)
        const types = this.actions.onInit;
        if (types) {
            ArrayUtils.asArray(types).forEach(type => this.store.dispatch({ type }));
        }
    }

    ngOnDestroy() {
        this.headerForm?.destroy();
        this.columnForm?.destroy();
        this.sidebarForm?.destroy();
        this.leftSidebarForm?.destroy();
    }

    reload() {
        this.awaitingSelectionReset = true;
        this.fullSelectionSnapshot = undefined;

        this.search.reload();
    }

    onFilterCleared() {
        if (this.search.queryMode === QueryMode.ON_TRIGGER) {
            this.search.clearResults();
            this.selection.reset();
        }
    }

    resetFilters() {
        this.headerForm?.reset('default');
        this.columnForm?.reset('default');
        this.sidebarForm?.reset('default');
        this.leftSidebarForm?.reset('default');
    }

    TOGGLE_INFO_DRAWER() {
        this.sidebar.toggleContent(SidebarContentType.Info);
    }

    toggleSidebarFilters() {
        this.sidebar.toggleContent(SidebarContentType.Form);
    }

    togglePresetPanel() {
        this.sidebar.toggleContent(SidebarContentType.Preset);
    }

    ['[SEARCH] TOGGLE_SIDEBAR_CONTENT'](content: SidebarContent) {
        this.sidebar.toggleContent(content);
    }

    ['[SEARCH] PREVIEW_RESULT']() {
        this.showPreviewSource.next(true);
    }

    closePreview() {
        this.showPreviewSource.next(false);
    }

    toggleView() {
        this.view.toggle();
    }

    clearPreferences() {
        this.preferencesService.clear();
    }

    loadPresets() {
        this.store.dispatch(loadPresets({ payload: { preferencesId: this.preferencesId } }));
    }

    savePreset() {
        this.store.dispatch(savePreset({ payload: { forms: this.searchTableForms, options: { preferencesId: this.preferencesId, global: false } } }));
    }

    saveNewVersion(presetId: string) {
        this.store.dispatch(saveNewVersion({ payload: { presetId, forms: this.searchTableForms, options: { preferencesId: this.preferencesId } } }));
    }

    loadPreset(presetId: string) {
        this.store.dispatch(loadPreset({ payload: { presetId, forms: this.searchTableForms, options: { preferencesId: this.preferencesId } } }));
    }

    private get searchTableForms(): Array<{ form: ContezzaDynamicSearchForm; type: PresetType }> {
        return [
            {
                form: this.sidebarForm,
                type: PresetType.SidebarFilters,
            },
            {
                form: this.headerForm,
                type: PresetType.HeaderFilters,
            },
            {
                form: this.columnForm,
                type: PresetType.ColumnFilters,
            },
            { form: this.leftSidebarForm, type: PresetType.LeftSidebarFilters },
        ];
    }

    onSelectAll() {
        let selection$: Observable<Node[]>;
        switch (this.selectionMode) {
            case SelectionMode.MULTI_PAGE:
                // if `selectionMode = SelectionMode.MULTI_PAGE` then the 'select all' checkbox (if available) selects all results through all pages
                const MAX_ITEMS = 1000;
                const search = this.search as any;
                selection$ = this.fullSelectionSnapshot
                    ? of(this.fullSelectionSnapshot)
                    : this.searchParametersStore.state$.pipe(
                          tap(() => search.searchingSource.next(true)),
                          switchMap(state =>
                              ContezzaObservables.while<ResultSetPaging>(
                                  (response, i) => response?.list.pagination.totalItems > i * MAX_ITEMS,
                                  (_, i) => search.doSearch({ ...state, paging: { skipCount: i * MAX_ITEMS, maxItems: MAX_ITEMS } }),
                                  (response1, response2) => {
                                      response1.list.entries = response1.list.entries.concat(response2.list.entries);
                                      return response1;
                                  },
                              ),
                          ),
                          tap(() => search.searchingSource.next(false)),
                          map(response => response.list.entries.map(_ => _.entry as Node)),
                          tap(selection => (this.fullSelectionSnapshot = selection)),
                      );
                break;
            case SelectionMode.SINGLE_PAGE:
                selection$ = this.results$.pipe(map(_ => _.list));
                break;
        }

        selection$.pipe(take(1)).subscribe(selection => this.selection.add(selection));
    }

    onSortingChange(sorting: Sort) {
        this.searchParametersStore.patchState({ sorting: SortingUtils.ngToAlfresco(sorting) });
    }

    onPagingChange(paging: PageEvent) {
        this.searchParametersStore.patchState({ paging: PagingUtils.ngToAlfresco(paging) });
    }

    onTopOverscroll() {
        this.searchParametersStore.paging$.pipe(take(1)).subscribe(paging => {
            if (paging.skipCount === 0) {
                this.reload();
            } else {
                this.searchParametersStore.patchState({ paging: { ...paging, skipCount: 0 } });
            }
        });
    }

    onMouseEvent(event: MouseEvent) {
        const type = this.actions[event.type];
        if (type) {
            if (type === 'CONTEXT_MENU') {
                // dispatch any to force set currentFolder and selection
                this.store.dispatch({ type: 'any' });
                this.contextMenu.open(event);
            } else if (typeof type === 'string') {
                this.store.dispatch({ type, event });
            }
        }
    }

    dblClickIfMobile() {
        if (this.isMobile) {
            const type = this.actions.dblclick;
            if (type) {
                this.store.dispatch({ type });
            }
        }
    }

    onBreadcrumbNavigate(entry: Node) {
        const type = this.actions.breadcrumbNavigate;
        if (type) {
            this.store.dispatch({ type, payload: { entry } });
        }
    }

    onColumnResized(column: Partial<Column>) {
        this.columns.update(column);
    }

    onDrop() {
        // dispatch any to force set currentFolder and selection
        this.store.dispatch({ type: 'any' });
    }
}
