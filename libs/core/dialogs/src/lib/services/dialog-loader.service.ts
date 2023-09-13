import { Injectable } from '@angular/core';
import { ComponentType } from '@angular/cdk/overlay';
import { MatDialogConfig } from '@angular/material/dialog';

import { from, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { DialogOutletService } from './dialog-outlet.service';

export type DialogDataType<TComponent> = TComponent extends { data: infer TData } ? TData : never;
export type DialogResponseType<TComponent> =
    | (TComponent extends { response: infer TResponse } ? TResponse : TComponent extends { response$: Observable<infer TResponse$> } ? TResponse$ : never)
    | undefined;

@Injectable({ providedIn: 'root' })
export class DialogLoaderService {
    constructor(private readonly dialog: DialogOutletService<unknown, unknown, unknown>) {}

    open<TComponent, TData = DialogDataType<TComponent>, TResponse = DialogResponseType<TComponent>>(
        component$: () => Promise<ComponentType<TComponent>>,
        data: MatDialogConfig<TData> & { data }
    ): Observable<TResponse> {
        return from(component$()).pipe(switchMap((component) => this.dialog.open({ getComponent: () => component }, data) as Observable<any>));
    }
}
