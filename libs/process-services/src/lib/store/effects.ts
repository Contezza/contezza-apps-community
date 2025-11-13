import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { catchError, filter, map, switchMap, take } from 'rxjs/operators';

import { AppStore, getAppSelection, getRuleContext } from '@alfresco/aca-shared/store';
import { approve, claim, complete, navigateToTask, reject, release, save, TaskService } from '@contezza/process-services/shared';
import { showSnackbarInfo } from '@contezza/core/notifications';
import { RefreshSubject } from '@contezza/core/services';
import { NodeEntry } from '@alfresco/js-api';

@Injectable()
export class Effects {
    constructor(
        private readonly actions$: Actions,
        private readonly store: Store<AppStore>,
        private readonly router: Router,
        private readonly taskService: TaskService,
        private readonly refresh$: RefreshSubject
    ) {}

    private readonly success$ = of(showSnackbarInfo({ payload: 'PROCESS_SERVICES.MESSAGES.INFO.TASK_UPDATED_SUCCESS' }));

    private handleError(context: string) {
        return catchError((err) => {
            console.error(`${context} error`, err);
            return EMPTY;
        });
    }

    private refreshAndNotify() {
        this.refresh$.next();
        return this.success$;
    }

    readonly navigateToTask$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(navigateToTask),
                switchMap(
                    ({ payload }): Observable<NodeEntry> =>
                        payload
                            ? of(payload)
                            : this.store.select(getAppSelection).pipe(
                                  take(1),
                                  map((selection) => selection.last)
                              )
                ),
                switchMap(({ entry }) => this.router.navigate(['process-services', 'tasks', entry.id]))
            ),
        { dispatch: false }
    );

    readonly save$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(save),
                map(({ payload }) => payload),
                switchMap(({ task, comment }) =>
                    this.taskService.processTask(task.id, { prop_bpm_comment: comment ?? '' }).pipe(
                        this.handleError('save'),
                        filter(Boolean),
                        switchMap(() => this.refreshAndNotify())
                    )
                )
            ),
        { dispatch: false }
    );

    readonly claim$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(claim),
                switchMap(() =>
                    this.store.select(getRuleContext).pipe(
                        take(1),
                        switchMap(({ navigation, profile }) => {
                            const taskId = navigation.url.split('/').pop()!;
                            return this.taskService.updateTask(taskId, { cm_owner: profile.id }).pipe(
                                this.handleError('claim'),
                                filter(Boolean),
                                switchMap(() => this.refreshAndNotify())
                            );
                        })
                    )
                )
            ),
        { dispatch: false }
    );

    readonly release$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(release),
                switchMap(() =>
                    this.store.select(getRuleContext).pipe(
                        take(1),
                        switchMap(({ navigation }) => {
                            const taskId = navigation.url.split('/').pop()!;
                            return this.taskService.updateTask(taskId, { cm_owner: null }).pipe(
                                this.handleError('release'),
                                filter(Boolean),
                                switchMap(() => this.refreshAndNotify())
                            );
                        })
                    )
                )
            ),
        { dispatch: false }
    );

    readonly complete$ = this.createTaskEffect(complete, {
        prop_bpm_status: 'Completed',
        prop_transitions: 'Next',
    });

    readonly approve$ = this.createTaskEffect(approve, {
        prop_imwf_reviewOutcome: 'approve',
        prop_transitions: 'Next',
    });

    readonly reject$ = this.createTaskEffect(reject, {
        prop_imwf_reviewOutcome: 'reject',
        prop_transitions: 'Next',
    });

    private createTaskEffect(action, extraProps: Record<string, string>) {
        return createEffect(
            () =>
                this.actions$.pipe(
                    ofType(action),
                    map(({ payload }) => payload),
                    switchMap(({ task, comment }) =>
                        this.taskService.processTask(task.id, { prop_bpm_comment: comment ?? '', ...extraProps }).pipe(
                            this.handleError(action.type),
                            filter(Boolean),
                            switchMap(() => this.refreshAndNotify())
                        )
                    )
                ),
            { dispatch: false }
        );
    }
}
