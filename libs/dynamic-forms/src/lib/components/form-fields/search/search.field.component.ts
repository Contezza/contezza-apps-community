import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { TranslateModule } from '@ngx-translate/core';

import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { catchError, pluck, startWith, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { ResultSetPagingList, ResultSetRowEntry, SearchRequest } from '@alfresco/js-api';
import { PipeModule } from '@alfresco/adf-core';
import { SearchService } from '@alfresco/adf-content-services';
import { DocumentListPresetRef, ExtensionService } from '@alfresco/adf-extensions';

import { ContezzaLetModule } from '@contezza/core/directives';
import { GetValuePipe } from '@contezza/core/pipes';
import { DestroyService } from '@contezza/core/services';
import { ContezzaAdfUtils } from '@contezza/core/utils';

import { ContezzaDynamicSearchForm, ExtendedDynamicFormId } from '@contezza/dynamic-forms/shared';

import { ContezzaBaseFieldComponent } from '../base-field.component';
import { ContezzaDynamicFormComponent } from '../../dynamic-form';
import { ContezzaDynamicSearchFormService } from '../../../services';

interface StyleEntry {
    class?: string;
    style?: string;
}

interface Settings {
    dynamicFormId: ExtendedDynamicFormId;
    columnsId: string;
    styles?: {
        item?: StyleEntry;
    };
}

@Component({
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatCardModule,
        MatIconModule,
        MatProgressSpinnerModule,
        TranslateModule,
        PipeModule,
        ContezzaLetModule,
        GetValuePipe,
        ContezzaDynamicFormComponent,
    ],
    selector: 'contezza-search-field',
    templateUrl: 'search.field.component.html',
    styleUrls: ['search.field.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: 'contezza-search-field contezza-form-field mat-form-field adf-property-field adf-card-textitem-field' },
})
export class SearchFieldComponent<T> extends ContezzaBaseFieldComponent<T, T> implements OnInit, OnDestroy {
    static readonly DEFAULT_QUERY_TEMPLATE: Omit<SearchRequest, 'query'> = {
        include: ['path', 'properties', 'aspectNames', 'allowableOperations'],
        sort: [{ type: 'FIELD', field: 'cm:modified', ascending: false }],
        paging: { maxItems: 10 },
    };

    private readonly loadingSource = new BehaviorSubject<boolean>(false);
    readonly loading$ = this.loadingSource.asObservable();
    readonly searchTrigger$ = new Subject<void>();

    searchForm: ContezzaDynamicSearchForm;
    columns: (DocumentListPresetRef & { style?: string })[];
    searchResults$: Observable<ResultSetPagingList>;
    selectedItem$: Observable<T>;

    styles?: Settings['styles'];

    constructor(
        destroy$: DestroyService,
        private readonly searchService: SearchService,
        private readonly extensions: ExtensionService,
        private readonly dynamicformSearchService: ContezzaDynamicSearchFormService
    ) {
        super(destroy$);
    }

    ngOnInit(): void {
        super.ngOnInit();

        const settings: Settings = this.field.settings as Settings;
        this.searchForm = this.dynamicformSearchService.get(settings.dynamicFormId);
        this.searchForm.build();
        this.columns = ContezzaAdfUtils.filterAndSortFeature(this.extensions.getFeature('columns')?.find(({ id }) => id === settings.columnsId)?.columns ?? []);

        // dynamic queryTemplate from extras
        const queryTemplate$: Observable<Partial<Omit<SearchRequest, 'query'>>> = this.field.extras?.queryTemplate || of({});

        // search only when triggered
        this.searchResults$ = this.searchTrigger$.pipe(
            tap(() => this.loadingSource.next(true)),
            withLatestFrom(queryTemplate$.pipe(startWith({}))),
            withLatestFrom(this.searchForm.query),
            switchMap(([[, template], query]) =>
                this.doSearch({
                    // default template
                    ...SearchFieldComponent.DEFAULT_QUERY_TEMPLATE,
                    // template from df configuration
                    ...template,
                    // query from search subform
                    query: { query, language: 'afts' },
                })
            ),
            tap(() => this.loadingSource.next(false))
        );

        this.selectedItem$ = this.control.valueChanges;

        this.styles = settings.styles;
    }

    private doSearch(request: SearchRequest): Observable<ResultSetPagingList> {
        return this.searchService.searchByQueryBody(request).pipe(
            pluck('list'),
            catchError(() => of(undefined))
        );
    }

    search() {
        this.searchTrigger$.next();
    }

    clearSearchForm(): void {
        this.searchForm.reset('default');
    }

    select(item: ResultSetRowEntry) {
        this.control.setValue(item);
    }
}
