import { Injectable, Injector, ɵcreateInjector as createInjector } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

import { Observable } from 'rxjs';

import { BaseDialogService, ModuleWithComponent } from './lazy-dialog.service';

@Injectable()
export class MatDialogService<DialogType, DataType, ReturnType> implements BaseDialogService<DialogType, DataType, ReturnType> {
    constructor(private readonly injector: Injector, private readonly matDialog: MatDialog) {}

    open(module: ModuleWithComponent<DialogType>, data: MatDialogConfig<DataType>): Observable<ReturnType> {
        createInjector(module, this.injector);
        return this.matDialog.open<DialogType, DataType, ReturnType>(module.getComponent(), data).afterClosed();
    }
}
