import { Injectable } from '@angular/core';

import { AppStore } from '@alfresco/aca-shared/store';

import { loadPreset, loadPresets, PresetService, remove, saveNewVersion, savePreset, showDetails, updateTitle } from '@contezza/content-services/presets/shared';

import { Store } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';

import { catchError, filter, map, of, switchMap, tap } from 'rxjs';

import { DialogLoaderService } from '@contezza/core/dialogs';
import { showSnackbarInfo } from '@contezza/core/notifications';
import { ContentApiService } from '@alfresco/aca-shared';
import { RefreshSubject } from '@contezza/core/services';
import { NodesApiService } from '@alfresco/adf-content-services';

@Injectable()
export class Effects {
    constructor(
        private readonly actions$: Actions,
        private readonly presetService: PresetService,
        private readonly store: Store<AppStore>,
        private readonly dialog: DialogLoaderService,
        private readonly refresh$: RefreshSubject,
        private readonly content: ContentApiService,
        private readonly nodes: NodesApiService
    ) {}

    readonly loadPresets$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(loadPresets),
                map((action) => action.payload),
                map((payload) => this.presetService.loadPresets(payload.preferencesId))
            ),
        { dispatch: false }
    );

    readonly loadPreset$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(loadPreset),
                map((action) => action.payload),
                map((payload) => {
                    this.presetService.loadPresetById(payload.presetId, payload.forms, { preferencesId: payload.options.preferencesId });
                })
            ),
        { dispatch: false }
    );

    readonly savePreset$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(savePreset),
                map((action) => action.payload),
                switchMap((payload) =>
                    this.presetService.getPresetTitle$().pipe(
                        map((title) => ({
                            content: this.presetService.getPresetJson(payload.forms, payload.options.preferencesId),
                            name: this.presetService.getPresetName(payload.options.preferencesId),
                            properties: { 'cm:title': title },
                            global: payload.options.global,
                        }))
                    )
                ),
                switchMap((preset) => this.presetService.save({ json: preset.content, nodeName: preset.name, global: preset.global, properties: preset.properties })),
                filter(Boolean),
                tap(() => this.store.dispatch(showSnackbarInfo({ payload: 'CONTENT_SERVICES.PRESETS.MESSAGES.INFO.CREATE_PRESET_SUCCESS' })))
            ),
        { dispatch: false }
    );

    readonly showDetails$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(showDetails),
                map((action) => action.payload),
                map((payload) => {
                    this.dialog
                        .open(() => import('@contezza/content-services/presets/components/preset-details').then((_) => _.PresetDetailsDialogComponent), {
                            height: '80vh',
                            width: '80vw',
                            data: {
                                presetId: payload.presetId,
                            },
                        })
                        .subscribe();
                })
            ),
        { dispatch: false }
    );

    readonly updateTitle$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(updateTitle),
                map((action) => action.payload),
                switchMap((payload) => this.content.getNode(payload.presetId)),
                switchMap((node) => this.presetService.getPresetTitle$(node.entry.properties['cm:title']).pipe(map((title) => ({ node, title })))),
                switchMap((response) => this.nodes.updateNode(response.node.entry.id, { properties: { 'cm:title': response.title } })),
                filter(Boolean),
                tap(() => this.refresh$.next()),
                tap(() => this.store.dispatch(showSnackbarInfo({ payload: 'CONTENT_SERVICES.PRESETS.MESSAGES.INFO.UPDATE_PRESET_SUCCESS' })))
            ),
        { dispatch: false }
    );

    readonly saveNewVersion$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(saveNewVersion),
                map((action) => action.payload),
                switchMap((payload) =>
                    this.content.getNode(payload.presetId).pipe(
                        catchError(() => of(undefined)),
                        filter(Boolean),
                        map((node) => ({ node, forms: payload.forms, preferencesId: payload.options.preferencesId }))
                    )
                ),
                map((response) => ({ node: response.node, json: this.presetService.getPresetJson(response.forms, response.preferencesId) })),
                switchMap((preset) => this.presetService.save({ json: preset.json, nodeName: preset.node.entry.name, nodeId: preset.node.entry.id })),
                filter(Boolean),
                tap(() => this.store.dispatch(showSnackbarInfo({ payload: 'CONTENT_SERVICES.PRESETS.MESSAGES.INFO.SAVE_NEW_VERSION_SUCCESS' })))
            ),
        { dispatch: false }
    );

    readonly remove$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(remove),
                map((action) => action.payload),
                switchMap((payload) => this.content.deleteNode(payload.presetId)),
                tap(() => this.refresh$.next()),
                tap(() => this.store.dispatch(showSnackbarInfo({ payload: 'CONTENT_SERVICES.PRESETS.MESSAGES.INFO.REMOVE_PRESET_SUCCESS' })))
            ),
        { dispatch: false }
    );
}
