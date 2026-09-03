import { inject, Injectable } from '@angular/core';

import { Actions, createEffect, ofType } from '@ngrx/effects';

import { switchMap } from 'rxjs';

import { DialogService } from '@contezza/core/dialogs';
import { EffectsHelper } from '@contezza/core/effects-helper';

import { RmaApi } from '@contezza/alfresco/rm/apis';
import { readRmauditlog, showAuditlogDetails } from '@contezza/alfresco/rm/shared';

@Injectable()
export class Effects {
    // constructor
    private readonly actions$ = inject(Actions);
    private readonly helper = inject(EffectsHelper);
    private readonly dialog = inject(DialogService);
    private readonly rmaApi = inject(RmaApi);

    readonly readRmauditlog$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(readRmauditlog),
                this.helper.getPayload('last'),
                switchMap(node =>
                    this.rmaApi.readNodeRmauditlog('workspace', 'SpacesStore', node.id).pipe(
                        switchMap(({ data: rmauditlog }) =>
                            this.dialog.open({
                                autoFocus: false,
                                width: '70%',
                                data: {
                                    title: {
                                        label: 'ALFRESCO.RM.DIALOGS.RMAUDITLOG.TITLE',
                                        params: { name: node.name },
                                    },
                                    content: {
                                        component: () => import('@contezza/alfresco/rm/components/rmauditlog').then(_ => _.RmaudilogComponent),
                                        inputs: { rmauditlog },
                                    },
                                    actions: [
                                        {
                                            id: 'close',
                                            title: 'APP.BUTTONS.CLOSE',
                                        },
                                    ],
                                },
                            }),
                        ),
                    ),
                ),
            ),
        { dispatch: false },
    );

    readonly showAuditlogDetails$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(showAuditlogDetails),
                this.helper.getPayload('last'),
                switchMap(rmauditlogEntry =>
                    this.dialog.open({
                        autoFocus: false,
                        width: '70%',
                        data: {
                            title: {
                                label: 'ALFRESCO.RM.DIALOGS.SHOW_AUDITLOG_DETAILS.TITLE',
                                params: { name: rmauditlogEntry.nodeName },
                            },
                            content: {
                                component: () => import('@contezza/alfresco/rm/components/rmauditlog').then(_ => _.RmaudilogComponent),
                                inputs: { rmauditlog: { entries: [rmauditlogEntry] } },
                            },
                            actions: [
                                {
                                    id: 'close',
                                    title: 'APP.BUTTONS.CLOSE',
                                },
                            ],
                        },
                    }),
                ),
            ),
        { dispatch: false },
    );
}
