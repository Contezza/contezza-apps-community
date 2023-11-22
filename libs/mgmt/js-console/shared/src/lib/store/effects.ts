import { Injectable, Optional } from '@angular/core';

import { Store } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';

import { Observable, of } from 'rxjs';
import { filter, map, pluck, switchMap, take } from 'rxjs/operators';

import { NodeEntry, SiteEntry } from '@alfresco/js-api';
import { SelectionState } from '@alfresco/adf-extensions';
import { AppStore, getAppSelection } from '@alfresco/aca-shared/store';

import { navigate } from '@contezza/common';

import { openNode } from './actions';
import { ConfigService } from '../config.service';

@Injectable()
export class Effects {
    static readonly NODEREF_PREFIX = 'workspace://SpacesStore';

    constructor(private readonly actions$: Actions, private readonly store: Store<AppStore>, @Optional() private readonly config?: ConfigService) {}

    readonly openNode$ = createEffect(() =>
        this.actions$.pipe(
            ofType(openNode),
            filter(() => {
                if (!this.config?.path) {
                    console.warn('No path defined for js-console. Please provide one by using `JsConsoleExtensionModule.withConfig({ path })`.');
                    return false;
                } else {
                    return true;
                }
            }),
            switchMap(({ payload }) => (payload ? of(payload) : this.selection$.pipe(pluck('last')))),
            filter<NodeEntry | SiteEntry>(Boolean),
            pluck('entry'),
            map((node) => ('guid' in node ? { id: node.guid, name: node.title } : node)),
            map(({ id, name }) =>
                navigate({
                    payload: [[this.config.path], { queryParams: { nodeRef: `${Effects.NODEREF_PREFIX}/${id}`, name } }],
                })
            )
        )
    );

    private get selection$(): Observable<SelectionState> {
        return this.store.select(getAppSelection).pipe(take(1));
    }
}
