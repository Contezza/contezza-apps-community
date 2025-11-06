import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, switchMap, take } from 'rxjs';
import { DialogLoaderService } from '@contezza/core/dialogs';
import { showDetails } from '@contezza/process-services/shared';
import { AppStore, getAppSelection } from '@alfresco/aca-shared/store';
import { Store } from '@ngrx/store';
import { SelectionState } from '@alfresco/adf-extensions';

@Injectable()
export class Effects {
    constructor(private readonly actions$: Actions, private readonly store: Store<AppStore>, private readonly dialog: DialogLoaderService) {}

    readonly effect$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(showDetails),
                switchMap(() =>
                    this.store.select(getAppSelection).pipe(
                        take(1),
                        map((selection: SelectionState) => selection.last.entry)
                    )
                ),
                switchMap((value) =>
                    this.dialog.open(() => import('@contezza/process-services/components/tasks').then((_) => _.TaskDetailsDialogComponent), {
                        width: '60%',
                        height: '80vh',
                        autoFocus: false,
                        data: {
                            task: value,
                        },
                    })
                )
            ),
        { dispatch: false }
    );
}
