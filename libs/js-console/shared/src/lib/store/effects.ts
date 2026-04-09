import { Inject, Injectable, Optional } from '@angular/core';

import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';

import { filter, map, Observable, of, pluck, switchMap, take } from 'rxjs';

import { AppStore, getAppSelection } from '@alfresco/aca-shared/store';
import { SelectionState } from '@alfresco/adf-extensions';
import { NodeEntry, SiteEntry } from '@alfresco/js-api';

import { navigate } from '@contezza/core/actions';

import { EXTENSION_CONFIG, ExtensionConfig } from '../models';
import { openNode } from './actions';

@Injectable()
export class Effects {
    static readonly NODEREF_PREFIX = 'workspace://SpacesStore';

    constructor(
        private readonly actions$: Actions,
        private readonly store: Store<AppStore>,
        @Inject(EXTENSION_CONFIG) @Optional() private readonly config?: ExtensionConfig,
    ) {}

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
            map(node => ('guid' in node ? { id: node.guid, name: node.title } : node)),
            map(({ id, name }) =>
                navigate({
                    payload: [[this.config.path], { queryParams: { nodeRef: `${Effects.NODEREF_PREFIX}/${id}`, name } }],
                }),
            ),
        ),
    );

    private get selection$(): Observable<SelectionState> {
        return this.store.select(getAppSelection).pipe(take(1));
    }
}
