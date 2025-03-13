import { Injectable } from '@angular/core';

import { Observable, of, Subject } from 'rxjs';
import { debounceTime, map, switchMap, take, tap } from 'rxjs/operators';

import { Site } from '@alfresco/js-api';
import { SitesService } from '@alfresco/adf-content-services';

import { ContezzaObjectUtils } from '@contezza/core/utils';

/**
 * Retrieves and stores site titles.
 * Useful in: breadcrumb, facets.
 */
@Injectable({
    providedIn: 'root',
})
export class SiteTitlesService {
    // repository is hardcoded in the site list because it does not appear in the getSites() response
    private readonly sites: Site[] = [{ id: '_REPOSITORY_', title: 'Repository' } as Site];

    private readonly sitesSource = new Subject<Site[]>();
    private readonly fetchSitesTrigger = new Subject<void>();

    constructor(private readonly sitesService: SitesService) {
        this.fetchSitesTrigger
            .pipe(
                debounceTime(0),
                switchMap(() => this.sitesService.getSites()),
                map((sites) => sites.list.entries.map(({ entry }) => entry)),
                tap((sites) => sites.filter((site) => !ContezzaObjectUtils.findMatch(site, this.sites)).forEach((site) => this.sites.push(site)))
            )
            .subscribe((sites) => this.sitesSource.next(sites));
    }

    fetchSites() {
        this.fetchSitesTrigger.next();
    }

    getTitle(site: Partial<Site>): Observable<string> {
        const match = ContezzaObjectUtils.findMatch(site, this.sites);
        if (match) {
            return of(match.title);
        } else {
            this.fetchSites();
            return this.sitesSource.pipe(
                take(1),
                map((sites) => ContezzaObjectUtils.findMatch(site, sites)?.title)
            );
        }
    }
}
