import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { Actions, createEffect, ofType } from '@ngrx/effects';

import { tap } from 'rxjs/operators';

import { navigate } from './actions';

@Injectable()
export class Effects {
    constructor(private readonly actions$: Actions, private readonly router: Router) {}

    readonly navigate$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(navigate),
                tap(({ payload }) => this.router.navigate(...payload))
            ),
        { dispatch: false }
    );
}
