import { Injectable } from '@angular/core';

import { Actions, createEffect, ofType } from '@ngrx/effects';

import { filter, map, switchMap } from 'rxjs';

import { NodesApiService } from '@alfresco/adf-content-services';

import { navigateTo } from '@contezza/core/actions';
import { DialogLoaderService } from '@contezza/core/dialogs';
import { EffectsHelper } from '@contezza/core/effects-helper';

import { managePermissions, navigateToParent, rotateFileInViewer, showComments } from '@contezza/content-services/shared';

@Injectable()
export class Effects {
    constructor(
        private readonly actions$: Actions,
        private readonly helper: EffectsHelper,
        private readonly dialog: DialogLoaderService,
        private readonly nodes: NodesApiService
    ) {}

    readonly managePermissions$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(managePermissions),
                this.helper.getPayload('last'),
                switchMap((node) =>
                    this.dialog.open(() => import('../components/dialogs/manage-permissions/manage-permissions.dialog.component').then((_) => _.ManagePermissionsDialogComponent), {
                        autoFocus: false,
                        width: '60%',
                        minWidth: '620px',
                        data: node.id,
                    })
                )
            ),
        { dispatch: false }
    );

    readonly showComments$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(showComments),
                this.helper.getPayload('last'),
                switchMap((node) =>
                    this.dialog.open(() => import('../components/dialogs/comments/comments.dialog.component').then((_) => _.CommentsDialogComponent), {
                        autoFocus: false,
                        width: '40%',
                        data: {
                            nodeId: node.id,
                        },
                    })
                )
            ),
        { dispatch: false }
    );

    readonly navigateToParent$ = createEffect(() =>
        this.actions$.pipe(
            ofType(navigateToParent),
            this.helper.getPayload('last'),
            map((_) => _.parentId),
            filter(Boolean),
            switchMap((parentId) => this.nodes.getNode(parentId)),
            map((parentNode) => navigateTo({ payload: { entry: parentNode } }))
        )
    );

    readonly rotateFileInViewer$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(rotateFileInViewer),
                map(() => {
                    const pages: NodeListOf<HTMLElement> = document.querySelectorAll('.page');
                    pages.forEach((page: HTMLElement) => {
                        const degrees = page.style.transform.match(/\d+/g);

                        if (!degrees || Number(degrees[0]) === 0) {
                            page.style.transform = 'rotate(-90deg)';
                        } else {
                            let newDegrees = Number(degrees[0]) + 90;
                            if (newDegrees === 360) {
                                newDegrees = 0;
                            }
                            page.style.transform = page.style.transform.replace(degrees[0], newDegrees.toString());
                        }
                    });
                })
            ),
        { dispatch: false }
    );
}
