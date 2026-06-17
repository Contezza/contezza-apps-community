import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, Output, QueryList, ViewChildren } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { TranslateModule } from '@ngx-translate/core';

import { BehaviorSubject, filter, Observable, switchMap } from 'rxjs';

import { GenericBucket } from '@alfresco/js-api';

import { ActivableDirective, ContezzaLetDirective, IconDirective } from '@contezza/core/directives';
import { ContezzaUtils } from '@contezza/core/utils';

import { ExtendedFacetResponse, FacetSelection, FacetSuggestionsService } from '@contezza/content-services/search/components/facet-suggestions/shared';

@Component({
    standalone: true,
    imports: [CommonModule, TranslateModule, MatDividerModule, MatIconModule, MatProgressSpinnerModule, ContezzaLetDirective, ActivableDirective, MatButton, IconDirective],
    selector: 'contezza-search-facet-suggestions',
    templateUrl: 'facet-suggestions.component.html',
    styleUrls: ['facet-suggestions.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FacetSuggestionsComponent {
    // constructor
    private readonly facetSuggestionsService = inject(FacetSuggestionsService);

    @Input()
    loading$ = new BehaviorSubject<boolean>(false).asObservable();

    private readonly facetsSource = new BehaviorSubject<Array<ExtendedFacetResponse>>([]);
    readonly facets$: Observable<Array<ExtendedFacetResponse>> = this.facetsSource.pipe(
        filter(Boolean),
        switchMap(facets => this.facetSuggestionsService.getFacets(facets, this.facetSelection)),
    );

    @Input()
    facetSelection: FacetSelection[];

    @Input()
    set responseFacets(facets: Array<ExtendedFacetResponse>) {
        this.facetsSource.next(facets);
    }

    @Output()
    entryClicked = new EventEmitter<GenericBucket & { id: string }>();

    onEntryClicked(entry: GenericBucket, facet: ExtendedFacetResponse) {
        entry['id'] = ContezzaUtils.labelToId(facet.label);
        this.entryClicked.emit(entry as GenericBucket & { id: string });
    }

    @ViewChildren(ActivableDirective)
    activableElements!: QueryList<ActivableDirective>;
}
