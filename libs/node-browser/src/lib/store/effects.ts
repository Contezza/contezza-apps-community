import { Injectable } from '@angular/core';

import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';

import { map, switchMap } from 'rxjs/operators';

import { NavigateRouteAction } from '@alfresco/aca-shared/store';

import { NodeBrowserActions } from './index';
import { executeSearch, loadStores, nodeBrowse } from './actions';
import { NodeBrowserService } from '../services/node-browser.service';

@Injectable()
export class NodeBrowserEffects {
    constructor(private readonly actions$: Actions, private readonly nodeBrowserService: NodeBrowserService, private readonly store: Store<unknown>) {}

    loadStores$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(loadStores),
                switchMap(() => this.nodeBrowserService.getStores().pipe(switchMap((stores) => [NodeBrowserActions.setStores({ stores })])))
            ),
        { dispatch: true }
    );

    search$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(executeSearch),
                switchMap((action) =>
                    this.nodeBrowserService
                        .search(action.params)
                        .pipe(
                            switchMap((searchResponse) => [
                                NodeBrowserActions.setSearchResponse({ searchResponse }),
                                NodeBrowserActions.setLastSearchQuery({ lastSearchQuery: action.params.q }),
                            ])
                        )
                )
            ),
        { dispatch: true }
    );

    browse$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(nodeBrowse),
                map((action) => this.store.dispatch(new NavigateRouteAction(['node-browser/', action.nodeRef.split('/').pop()])))
            ),
        { dispatch: false }
    );
}
