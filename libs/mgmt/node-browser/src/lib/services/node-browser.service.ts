import { Injectable } from '@angular/core';

import { Store } from '@ngrx/store';

import { Observable, of } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';

import { WebscriptService } from '@contezza/core/services';

import { NodeBrowserSearchParams, NodeBrowserSearchResponse } from '../interfaces/node-browser-search';
import { NodeBrowserViewResponse } from '../interfaces/node-browser-view';
import { setBrowseLoading, setSearchLoading } from '../store/actions';

@Injectable({
    providedIn: 'root',
})
export class NodeBrowserService {
    private readonly STORES_URL = 'slingshot/node/stores';
    private readonly SEARCH_URL = 'slingshot/node/search';
    private readonly BROWSE_URL = 'slingshot/node/workspace/SpacesStore';

    constructor(private readonly webscript: WebscriptService, private readonly store: Store<unknown>) {}

    getStores(): Observable<Array<string>> {
        return this.webscript.get(this.STORES_URL).pipe(map((response: { stores }) => response?.stores));
    }

    search(params: NodeBrowserSearchParams): Observable<NodeBrowserSearchResponse> {
        const url = `${this.SEARCH_URL}?q=${params.q}&lang=${params.lang}&store=${params.store}&maxResults=${params.maxResults}`;
        this.store.dispatch(setSearchLoading({ searchLoading: true }));

        return this.webscript.get(url).pipe(
            map((response: any) => ({ success: response, error: null })),
            catchError((error) => {
                const parsedError = JSON.parse(JSON.stringify(error));
                this.store.dispatch(setSearchLoading({ searchLoading: false }));

                return of({ success: null, error: parsedError.response.body.message });
            }),
            finalize(() => this.store.dispatch(setSearchLoading({ searchLoading: false })))
        );
    }

    browse(nodeRef: string): Observable<NodeBrowserViewResponse> {
        const url = `${this.BROWSE_URL}/${nodeRef}`;
        this.store.dispatch(setBrowseLoading({ browseLoading: true }));

        return this.webscript.get(url).pipe(
            catchError(() => {
                this.store.dispatch(setBrowseLoading({ browseLoading: false }));
                return of(undefined);
            }),
            finalize(() => this.store.dispatch(setBrowseLoading({ browseLoading: false })))
        );
    }
}
