import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatAutocompleteModule, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';

import { TranslateModule } from '@ngx-translate/core';

import { Observable } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';

import { GenericBucket, NodeEntry, ResultSetPaging, ResultSetRowEntry, SearchRequest } from '@alfresco/js-api';

import { ContezzaLetModule } from '@contezza/core/directives';
import { StringUtils } from '@contezza/core/utils';
import { NavigateToResultPayload, SearchingService, SearchParametersStore, SearchResultsService } from '@contezza/content-services/search/shared';
import { FacetSelection } from '@contezza/content-services/search/components/facet-suggestions/shared';
import { FacetSuggestionsComponent } from '@contezza/content-services/search/components/facet-suggestions';

import { formatResultSettings, ResultSettings, SearchBarSettings } from '@contezza/content-services/search/components/search-bar/shared';

import { SearchResultComponent } from './components/search-result/search-result.component';

@Component({
    standalone: true,
    selector: 'contezza-search-bar',
    imports: [
        CommonModule,
        ContezzaLetModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatAutocompleteModule,
        MatProgressSpinnerModule,
        ReactiveFormsModule,
        TranslateModule,
        MatDividerModule,
        FacetSuggestionsComponent,
        SearchResultComponent,
    ],
    templateUrl: 'search-bar.component.html',
    styleUrls: ['search-bar.component.scss'],
    encapsulation: ViewEncapsulation.None,
    host: { class: 'search-bar' },
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [SearchingService, SearchParametersStore, SearchResultsService],
})
export class SearchBarComponent implements SearchBarSettings, OnInit {
    @Input()
    set settings(settings: SearchBarSettings) {
        const { resultSettings, ...rest } = settings;
        Object.assign(this, rest);
        this.resultSettings = formatResultSettings(resultSettings);
    }

    @Input()
    queryTemplate: string | Partial<SearchRequest>;

    @Input()
    set searchQueryFields(searchQueryFields: string[]) {
        this.searchQuery = searchQueryFields.map((field) => field + ':"${value}"').join(' OR ');
    }
    @Input()
    set searchQuery(searchQuery: string) {
        this.searchQueryTemplate = StringUtils.toTemplate(searchQuery, { requireAllParams: true });
    }
    @Input()
    searchQueryTemplate: (_: { value: string }) => string;

    @Input()
    facetSelection: FacetSelection[];

    @Input()
    minChars = 3;

    @Input()
    resultSettings: ResultSettings;

    @Output()
    search = new EventEmitter<NavigateToResultPayload | NodeEntry>();

    searchInput: FormControl<string | NodeEntry>;

    readonly alwaysFalse = () => false;

    @ViewChild('autocompleteInput')
    autocompleteInput: any;

    @ViewChild(MatAutocompleteTrigger)
    autocomplete: MatAutocompleteTrigger;

    readonly loading$: Observable<boolean> = this.searchResults.searching$;
    readonly nodeResults$: Observable<ResultSetPaging> = this.searchResults.results$;

    constructor(
        private readonly seachingSource: SearchingService,
        private readonly searchParametersStore: SearchParametersStore,
        private readonly searchResults: SearchResultsService
    ) {}

    ngOnInit() {
        this.searchInput = new FormControl('', [Validators.required, Validators.minLength(this.minChars)]);

        const { queryTemplate } = this;

        this.searchResults.queryTemplate = queryTemplate;
        this.searchParametersStore.switch(true);

        this.searchParametersStore.bindQuery(
            this.searchInput.valueChanges.pipe(
                filter((value): value is string => {
                    if (typeof value !== 'string') {
                        this.navigateToNode(value);
                        return false;
                    }
                    return true;
                }),
                tap(() => this.seachingSource.next(true)),
                filter(() => {
                    const valid = this.searchInput.valid;
                    if (!valid) {
                        this.seachingSource.next(false);
                    }
                    return valid;
                }),
                map((value) => this.searchQueryTemplate({ value }))
            ),
            'filterQuery'
        );
    }

    trackById(_: number, node: ResultSetRowEntry) {
        return node.entry.id;
    }

    displayFn(item): string {
        return item?.entry ? item.entry.name : '';
    }

    clearInput() {
        this.searchInput.setValue('');
    }

    closePanel() {
        setTimeout(() => {
            this.autocomplete.closePanel();
        });
    }

    onEnterPressed() {
        const searchTerm = this.searchInput.value;
        if (this.searchInput.valid && typeof searchTerm === 'string') {
            this.search.next({ q: searchTerm });
        }
    }

    onFacetClicked(bucket: GenericBucket & { id: string }) {
        const searchTerm = this.searchInput.value;
        if (this.searchInput.valid && typeof searchTerm === 'string') {
            this.search.next({ q: searchTerm, bucket });
        }
    }

    private navigateToNode(node: NodeEntry) {
        this.search.next(node);
    }
}
