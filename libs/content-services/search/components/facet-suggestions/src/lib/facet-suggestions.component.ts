import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { BehaviorSubject, Observable } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';

import { TranslateModule } from '@ngx-translate/core';

import { GenericBucket } from '@alfresco/js-api';

import { ContezzaLetDirective } from '@contezza/core/directives';
import { ContezzaUtils } from '@contezza/core/utils';

import { ExtendedFacetResponse, FacetSelection, FacetSuggestionsService } from '@contezza/content-services/search/components/facet-suggestions/shared';

@Component({
    standalone: true,
    imports: [CommonModule, TranslateModule, MatDividerModule, MatIconModule, MatProgressSpinnerModule, ContezzaLetDirective],
    selector: 'contezza-search-facet-suggestions',
    templateUrl: 'facet-suggestions.component.html',
    styleUrls: ['facet-suggestions.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FacetSuggestionsComponent {
    @Input()
    loading$ = new BehaviorSubject<boolean>(false).asObservable();

    private readonly facetsSource = new BehaviorSubject<Array<ExtendedFacetResponse>>([]);
    readonly facets$: Observable<Array<ExtendedFacetResponse>> = this.facetsSource.pipe(
        filter((value) => !!value),
        switchMap((facets) => this.facetSuggestionsService.getFacets(facets, this.facetSelection))
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

    constructor(private readonly facetSuggestionsService: FacetSuggestionsService) {}
}
