import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { Directive, Injector } from '@angular/core';
import { ComponentType } from '@angular/cdk/overlay';

import { from, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Directive()
// eslint-disable-next-line @angular-eslint/directive-class-suffix
export abstract class ContezzaAsyncDialogService<DialogType, DataType, ReturnType = unknown> {
    protected constructor(protected injector: Injector, protected matDialog: MatDialog) {}

    // TODO update ng14
    // @ts-ignore
    protected abstract async getDialogComponent(): Promise<ComponentType<DialogType>>;

    async open(data: MatDialogConfig<DataType>): Promise<MatDialogRef<DialogType, ReturnType>> {
        const component = await this.getDialogComponent();
        return this.matDialog.open(component, data);
    }

    afterClosed(data: MatDialogConfig<DataType>): Observable<ReturnType> {
        return from(this.open(data)).pipe(switchMap((dialogRef) => dialogRef.afterClosed()));
    }
}
