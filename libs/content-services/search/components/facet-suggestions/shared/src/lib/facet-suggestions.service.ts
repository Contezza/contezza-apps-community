import { Injectable } from '@angular/core';

import { forkJoin, map, Observable, of } from 'rxjs';

import { GenericBucket, GenericFacetResponse } from '@alfresco/js-api';

import { SiteTitlesService } from '@contezza/core/services';

import { ExtendedFacetResponse, FacetSelection } from './models';

@Injectable({
    providedIn: 'root',
})
export class FacetSuggestionsService {
    static readonly MAPPER_TYPE_ICON = {
        'SEARCH.INPUT.FILES': 'description',
        'SEARCH.INPUT.FOLDERS': 'folder',
        'SEARCH.INPUT.LIBRARIES': 'library_books',
    };

    constructor(private readonly siteTitles: SiteTitlesService) {}

    getFacets(facets: Array<ExtendedFacetResponse>, facetSelection: FacetSelection[]): Observable<Array<ExtendedFacetResponse>> {
        const extendedFacets: Observable<ExtendedFacetResponse>[] = facetSelection
            .map((selectedFacet) => {
                const foundFacet: GenericFacetResponse = facets.find((facet) => selectedFacet.label === facet.label);

                if (foundFacet) {
                    return forkJoin(
                        foundFacet.buckets.map((bucket) =>
                            this.makeBucketDisplay(bucket, selectedFacet).pipe(
                                map((display) => ({
                                    ...bucket,
                                    ['icon']:
                                        selectedFacet.icon === 'map.type'
                                            ? FacetSuggestionsService.MAPPER_TYPE_ICON[bucket.label]
                                            : selectedFacet.icon === 'map.file_type'
                                            ? `svg:${bucket.label}`
                                            : selectedFacet.icon,
                                    display,
                                }))
                            )
                        )
                    ).pipe(
                        map((buckets) => {
                            foundFacet.buckets = buckets;
                            return foundFacet;
                        })
                    );
                } else {
                    return undefined;
                }
            })
            .filter((value) => !!value);

        return forkJoin(extendedFacets);
    }

    private makeBucketDisplay(bucket: GenericBucket, facet?: FacetSelection): Observable<string> {
        if (facet?.label === 'SEARCH.FACET_FIELDS.LOCATION') {
            return this.siteTitles.getTitle({ id: bucket.label }).pipe(map((display) => display || bucket.display || bucket.label));
        } else {
            return of(bucket.display || bucket.label);
        }
    }
}
