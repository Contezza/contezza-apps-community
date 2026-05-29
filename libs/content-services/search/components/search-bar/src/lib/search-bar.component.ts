import { ActiveDescendantKeyManager } from '@angular/cdk/a11y';
import { CdkConnectedOverlay, CdkOverlayOrigin } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, OnInit, Output, QueryList, ViewChild, ViewChildren, ViewEncapsulation } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { TranslateModule } from '@ngx-translate/core';

import { filter, map, Observable, tap } from 'rxjs';

import { GenericBucket, NodeEntry, ResultSetPaging, ResultSetRowEntry, SearchRequest } from '@alfresco/js-api';

import { ActivableDirective, ContezzaLetModule } from '@contezza/core/directives';
import { StringUtils } from '@contezza/core/utils';

import { FacetSuggestionsComponent } from '@contezza/content-services/search/components/facet-suggestions';
import { FacetSelection } from '@contezza/content-services/search/components/facet-suggestions/shared';
import { formatResultSettings, ResultSettings, SearchBarSettings } from '@contezza/content-services/search/components/search-bar/shared';
import { NavigateToResultPayload, SearchingService, SearchParametersStore, SearchResultsService } from '@contezza/content-services/search/shared';

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
        CdkOverlayOrigin,
        CdkConnectedOverlay,
    ],
    templateUrl: 'search-bar.component.html',
    styleUrls: ['search-bar.component.scss'],
    encapsulation: ViewEncapsulation.None,
    host: { class: 'search-bar' },
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [SearchingService, SearchParametersStore, SearchResultsService],
})
export class SearchBarComponent implements SearchBarSettings, OnInit {
    // constructor
    private readonly seachingSource = inject(SearchingService);
    private readonly searchParametersStore = inject(SearchParametersStore);
    private readonly searchResults = inject(SearchResultsService);

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
        this.searchQuery = searchQueryFields.map(field => field + ':"${value}"').join(' OR ');
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

    keyManager?: ActiveDescendantKeyManager<ActivableDirective>;

    panelOpen = false;

    searchInput: FormControl<string>;

    @ViewChild(FacetSuggestionsComponent)
    facetSuggestionsComponent!: FacetSuggestionsComponent;

    @ViewChildren(SearchResultComponent)
    searchResultComponents!: QueryList<SearchResultComponent<any>>;

    readonly loading$: Observable<boolean> = this.searchResults.searching$;
    readonly nodeResults$: Observable<ResultSetPaging> = this.searchResults.results$.pipe(
        // refresh key manager when new results are loaded
        // setTimeout is necessary because refreshKeyManager is based on ViewChild and ViewChildren that need to be rendered
        tap(() => setTimeout(() => this.refreshKeyManager())),
    );

    readonly alwaysFalse = () => false;

    ngOnInit() {
        this.searchInput = new FormControl('', [Validators.required, Validators.minLength(this.minChars)]);

        const { queryTemplate } = this;

        this.searchResults.queryTemplate = queryTemplate;
        this.searchParametersStore.switch(true);

        this.searchParametersStore.bindQuery(
            this.searchInput.valueChanges.pipe(
                tap(value => (this.panelOpen = !!value)),
                tap(() => this.seachingSource.next(true)),
                filter(() => {
                    const valid = this.searchInput.valid;
                    if (!valid) {
                        this.seachingSource.next(false);
                    }
                    return valid;
                }),
                map(value => this.searchQueryTemplate({ value })),
            ),
            'filterQuery',
        );
    }

    clearInput() {
        this.searchInput.setValue('');
    }

    openPanel() {
        this.panelOpen = true;
    }

    closePanel() {
        this.panelOpen = false;
    }

    /**
     * Handles keyboard interaction for the search input and result panel.
     *
     * The input keeps focus at all times while the result list is managed through
     * ActiveDescendantKeyManager using the `aria-activedescendant` pattern.
     *
     * Supported interactions:
     * - ArrowUp / ArrowDown:
     * Navigate through activable search results.
     *
     * - Enter:
     * Activates the currently highlighted result.
     * If no result is active, triggers a normal search using the current input value.
     *
     * - Escape:
     * Closes the search panel.
     *
     * @param event
     */
    onInputKeydown(event: KeyboardEvent): void {
        switch (event.key) {
            // Navigate through search results.
            case 'ArrowDown':
            case 'ArrowUp':
                this.keyManager.onKeydown(event);

                // Ensure the active item remains visible inside the scroll container.
                this.keyManager.activeItem?.scrollIntoView();

                event.preventDefault();
                break;

            // Activate current item or trigger search.
            case 'Enter':
                if (this.keyManager?.activeItem) {
                    // Delegate activation to the currently highlighted item.
                    this.keyManager.activeItem.click();
                } else {
                    // No active result:
                    // execute a normal search from the input value.
                    const searchTerm = this.searchInput.value;

                    if (this.searchInput.valid && typeof searchTerm === 'string') {
                        this.search.next({ q: searchTerm });
                    }
                }

                event.preventDefault();
                break;

            // Close the panel.
            case 'Escape':
                this.closePanel();
                event.preventDefault();
                break;
        }
    }

    onFacetClick(bucket: GenericBucket & { id: string }) {
        const searchTerm = this.searchInput.value;
        if (this.searchInput.valid && typeof searchTerm === 'string') {
            this.search.next({ q: searchTerm, bucket });
        }
    }

    onResultClick(item: NodeEntry | ResultSetRowEntry) {
        this.searchInput.setValue(item.entry.name, { emitEvent: false });
        this.search.next(item as NodeEntry);
    }

    private refreshKeyManager() {
        this.keyManager = new ActiveDescendantKeyManager([
            // facet suggestions
            ...(this.facetSuggestionsComponent?.activableElements.toArray() || []),
            // search results
            ...this.searchResultComponents.map(row => row.activableElements.toArray()).flat(),
        ]).withWrap();
    }
}
