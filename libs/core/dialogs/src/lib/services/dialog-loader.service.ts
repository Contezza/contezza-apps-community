import { Injectable } from '@angular/core';
import { ComponentType } from '@angular/cdk/overlay';
import { MatDialogConfig } from '@angular/material/dialog';

import { from, Observable, switchMap } from 'rxjs';

import { DialogOutletService } from './dialog-outlet.service';

export type DialogDataType<TComponent> = TComponent extends { data: infer TData } ? TData : undefined;
export type DialogResponseType<TComponent> =
    | (TComponent extends { response: infer TResponse } ? TResponse : TComponent extends { response$: Observable<infer TResponse$> } ? TResponse$ : never)
    | undefined;

type NoInfer<A> = [A][A extends any ? 0 : never];
type CustomMatDialogConfig<D> = D extends undefined ? MatDialogConfig<D> : MatDialogConfig<NoInfer<D>> & { data: NoInfer<D> };

@Injectable({ providedIn: 'root' })
export class DialogLoaderService {
    constructor(private readonly dialog: DialogOutletService<unknown, unknown, unknown>) {}

    open<TComponent, TData = DialogDataType<TComponent>, TResponse = DialogResponseType<TComponent>>(
        component$: () => Promise<ComponentType<TComponent>>,
        data: CustomMatDialogConfig<TData>
    ): Observable<TResponse> {
        return from(component$()).pipe(switchMap((component) => this.dialog.open({ getComponent: () => component }, data) as Observable<any>));
    }
}
