import { Injectable } from '@angular/core';
import { MatDialogConfig } from '@angular/material/dialog';

import { from, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { DialogOutletService, ModuleWithComponent } from './dialog-outlet.service';

abstract class DialogComponentServiceClass<DialogComponentType, DataType, ReturnType> {
    // getter instead of property to ensure lazyness
    protected abstract get module(): Promise<Record<any, ModuleWithComponent<DialogComponentType>>>;

    protected constructor(private readonly dialog: DialogOutletService<DialogComponentType, DataType, ReturnType>) {}

    open(data: MatDialogConfig<DataType>): Observable<ReturnType | undefined> {
        return from(this.module).pipe(switchMap((m) => this.dialog.open(Object.values(m)[0], data)));
    }
}

@Injectable()
export abstract class DialogComponentService<DialogComponentType, DataType, ReturnType> extends DialogComponentServiceClass<DialogComponentType, DataType, ReturnType> {
    protected constructor(dialog: DialogOutletService<DialogComponentType, DataType, ReturnType>) {
        super(dialog);
    }
}
