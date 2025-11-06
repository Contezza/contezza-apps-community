import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { showDetails } from '@contezza/content-services/presets/shared';
import { tap } from 'rxjs';
import { DialogLoaderService } from '@contezza/core/dialogs';

@Injectable()
export class Effects {
    constructor(private readonly actions$: Actions, private readonly dialog: DialogLoaderService) {}

    readonly effect$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(showDetails),
                tap((value) => console.log(value)),
                tap(() => console.log(this.dialog))
            ),
        { dispatch: false }
    );
}
