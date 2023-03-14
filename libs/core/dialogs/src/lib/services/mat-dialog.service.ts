import { Injectable, Injector, Provider, ɵcreateInjector as createInjector } from '@angular/core';

import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

import { Observable } from 'rxjs';

import { DialogOutletService, ModuleWithComponent } from './dialog-outlet.service';

@Injectable()
export class MatDialogService<DialogType, DataType, ReturnType> implements DialogOutletService<DialogType, DataType, ReturnType> {
    static provider: Provider = { provide: DialogOutletService, useClass: MatDialogService };

    constructor(private readonly injector: Injector, private readonly matDialog: MatDialog) {}

    open(module: ModuleWithComponent<DialogType>, data: MatDialogConfig<DataType>): Observable<ReturnType> {
        createInjector(module, this.injector);
        return this.matDialog.open<DialogType, DataType, ReturnType>(module.getComponent(), data).afterClosed();
    }
}
