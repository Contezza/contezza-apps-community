import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';

import { filter, map, switchMap, take, tap } from 'rxjs/operators';
import { combineLatest } from 'rxjs';

import { SnackbarErrorAction, SnackbarInfoAction } from '@alfresco/aca-shared/store';
import { ConfirmDialogComponent } from '@alfresco/adf-content-services';

import { JsConsoleActions } from './index';
import { getConsolePayloadInfo, getScriptsList, getSelectedScript } from './selectors';
import { OpenSaveScriptDialogPayload } from '../interfaces/js-console';

import { JsConsoleService } from '../services/console.service';
import { JsConsoleNodeActionsService } from '../services/node-actions.service';
import { JsConsoleSaveScriptService } from '../services/save-script.service';

@Injectable()
export class JsConsoleEffects {
    constructor(
        private readonly actions$: Actions,
        private readonly store: Store<unknown>,
        private readonly dialog: MatDialog,
        private readonly consoleService: JsConsoleService,
        private readonly saveScriptService: JsConsoleSaveScriptService,
        private readonly nodeActionsService: JsConsoleNodeActionsService
    ) {}

    executeScript$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(JsConsoleActions.executeScript),
                tap(() => this.store.dispatch(JsConsoleActions.setExecuteScriptLoading({ executeScriptLoading: true }))),
                switchMap(() =>
                    this.store.select(getConsolePayloadInfo).pipe(
                        take(1),
                        map((payloadInfo) => ({
                            documentNodeRef: payloadInfo.selectedNode.nodeRef,
                            resultChannel: '',
                            runas: payloadInfo.runas,
                            script: payloadInfo.jsSelected === '' ? payloadInfo.js : payloadInfo.jsSelected,
                            spaceNodeRef: payloadInfo.selectedSpaceNode.nodeRef,
                            template: payloadInfo.fm,
                            transaction: payloadInfo.transaction,
                            urlargs: payloadInfo.urlargs,
                        }))
                    )
                ),
                switchMap((payload) =>
                    this.consoleService
                        .executeScript(payload)
                        .pipe(
                            switchMap((response) => [
                                JsConsoleActions.setExecuteScriptLoading({ executeScriptLoading: false }),
                                JsConsoleActions.setConsoleOutput({ output: response }),
                            ])
                        )
                )
            ),
        { dispatch: true }
    );

    loadSelectedNodeContent$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(JsConsoleActions.loadSelectedNodeContent),
                switchMap((action) =>
                    this.consoleService
                        .getNodeContent(action.script.value.split('/').pop())
                        .pipe(
                            switchMap((response) => [
                                JsConsoleActions.setSelectedScript({ selectedScript: action.script }),
                                JsConsoleActions.setJsConsoleContent({ jsContent: response }),
                            ])
                        )
                )
            ),
        { dispatch: true }
    );

    loadScriptsList$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(JsConsoleActions.loadScriptsList),
                switchMap((action) =>
                    this.consoleService
                        .getScriptsList()
                        .pipe(
                            switchMap((list) => [
                                ...[JsConsoleActions.loadScriptsListSuccess({ scriptsList: list })],
                                ...(action.selectScript ? [JsConsoleActions.setSelectedScript({ selectedScript: action.selectScript })] : []),
                            ])
                        )
                )
            ),
        { dispatch: true }
    );

    selectScriptPayloadNode$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(JsConsoleActions.selectScriptPayloadNode),
                map((action) => this.nodeActionsService.selectScriptPayloadNode(action.payload))
            ),
        { dispatch: false }
    );

    saveNewScript$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(JsConsoleActions.saveScript),
                switchMap(() =>
                    combineLatest([this.store.select(getConsolePayloadInfo), this.store.select(getScriptsList), this.store.select(getSelectedScript)]).pipe(
                        take(1),
                        map(([payloadInfo, scripts, selectedScript]) => ({
                            payload: {
                                jsContent: payloadInfo.js,
                                fmContent: payloadInfo.fm,
                                selectedScript,
                            },
                            data: {
                                scripts,
                            },
                        }))
                    )
                ),
                switchMap((result: { payload: OpenSaveScriptDialogPayload; data: any }) => {
                    const saveResponse = !result.payload?.selectedScript
                        ? this.saveScriptService.saveNew(result.payload, false, result.data)
                        : this.saveScriptService.saveExisted(result.payload);

                    return saveResponse.pipe(
                        switchMap((response: any) =>
                            response
                                ? [
                                      JsConsoleActions.loadScriptsList({ selectScript: response.created }),
                                      !('errorMessage' in response)
                                          ? new SnackbarInfoAction('CONTEZZA.JS_CONSOLE.MESSAGES.SCRIPT_UPDATED_SUCCESSFULLY')
                                          : new SnackbarErrorAction(response.errorMessage),
                                  ]
                                : []
                        )
                    );
                })
            ),
        { dispatch: true }
    );

    duplicateScript$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(JsConsoleActions.duplicateScript),
                switchMap((action) =>
                    this.consoleService.getNodeContent(action.script.value.split('/').pop()).pipe(
                        filter((content) => !!content),
                        map((content) => ({
                            name: action.script.text,
                            scripts: action.scripts,
                            payload: {
                                jsContent: content,
                                fmContent: '',
                                selectedScript: undefined,
                            },
                        }))
                    )
                ),
                switchMap((result) =>
                    this.saveScriptService
                        .saveNew(result.payload, false, {
                            title: result.name,
                            scripts: result.scripts,
                        })
                        .pipe(
                            switchMap((response: any) =>
                                response
                                    ? [
                                          JsConsoleActions.loadScriptsList({ selectScript: undefined }),
                                          !('errorMessage' in response)
                                              ? new SnackbarInfoAction('CONTEZZA.JS_CONSOLE.MESSAGES.SCRIPT_CREATED_SUCCESSFULLY')
                                              : new SnackbarErrorAction(response.errorMessage),
                                      ]
                                    : []
                            )
                        )
                )
            ),
        { dispatch: true }
    );

    deleteScript$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(JsConsoleActions.deleteScript),
                map((action) => {
                    this.dialog
                        .open(ConfirmDialogComponent, {
                            data: {
                                title: 'CONTEZZA.JS_CONSOLE.DIALOGS.DELETE_SCRIPT.TITLE',
                                message: 'CONTEZZA.JS_CONSOLE.DIALOGS.DELETE_SCRIPT.MESSAGE',
                                yesLabel: 'CONTEZZA.JS_CONSOLE.DIALOGS.DELETE_SCRIPT.YES_LABEL',
                                noLabel: 'CONTEZZA.JS_CONSOLE.DIALOGS.DELETE_SCRIPT.NO_LABEL',
                            },
                            minWidth: '250px',
                        })
                        .afterClosed()
                        .subscribe((result) => {
                            if (result === true) {
                                this.store.dispatch({ type: 'DELETE_NODES', payload: action.payload });
                            }
                        });
                })
            ),
        { dispatch: false }
    );
}
