import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { TranslateService } from '@ngx-translate/core';

import { Actions, createEffect, ofType } from '@ngrx/effects';

import { map, of, switchMap, tap } from 'rxjs';

import { NotificationService as AdfNotificationService } from '@alfresco/adf-core';

import { DialogLoaderService } from '@contezza/core/dialogs';

import { NotificationService } from '../services/notification.service';
import { closeLoadingDialog, openErrorDetailsDialog, openLoadingDialog, showSnackbarError, showSnackbarInfo } from './actions';

@Injectable()
export class Effects {
    constructor(
        private readonly actions$: Actions,
        private readonly snackbar: MatSnackBar,
        private readonly translate: TranslateService,
        private readonly dialog: DialogLoaderService,
        private readonly adfNotifications: AdfNotificationService,
        private readonly notifications: NotificationService
    ) {}

    readonly openLoadingDialog$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(openLoadingDialog),
                switchMap((data) =>
                    this.dialog.open(() => import('../components/loading.dialog.component').then((m) => m.LoadingDialogComponent), {
                        disableClose: true,
                        data,
                    })
                )
            ),
        { dispatch: false }
    );

    readonly closeLoadingDialog$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(closeLoadingDialog),
                tap(() => this.notifications.closeDialog())
            ),
        { dispatch: false }
    );

    readonly openErrorDetailsDialog$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(openErrorDetailsDialog),
                switchMap(({ payload }) =>
                    this.snackbar
                        .open(this.translate.instant(payload.message), this.translate.instant('APP.MORE'), {
                            duration: payload.duration ?? 5000,
                            panelClass: 'adf-error-snackbar',
                        })
                        .afterDismissed()
                        .pipe(
                            switchMap(({ dismissedByAction }) =>
                                dismissedByAction
                                    ? this.dialog.open(() => import('../components/error-details/error-details.dialog.component').then((m) => m.ErrorDetailsDialogComponent), {
                                          width: '60vw',
                                          autoFocus: false,
                                          data: payload.details,
                                      })
                                    : of(undefined)
                            )
                        )
                )
            ),
        { dispatch: false }
    );

    // snackbar

    readonly showSnackbarInfo$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(showSnackbarInfo),
                map(({ payload }) => (typeof payload === 'string' ? { message: payload } : payload)),
                switchMap(({ message, interpolateArgs, action }) => {
                    const ref = this.adfNotifications.showInfo(message, action.label, interpolateArgs, !!action);
                    return action ? ref.onAction().pipe(switchMap(() => action.execute())) : of(void 0);
                }),
            ),
        { dispatch: false }
    );

    readonly showSnackbarError$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(showSnackbarError),
                map(({ payload }) => (typeof payload === 'string' ? { message: payload } : payload)),
                tap(({ message, interpolateArgs }) => this.adfNotifications.showError(message, null, interpolateArgs))
            ),
        { dispatch: false }
    );
}
