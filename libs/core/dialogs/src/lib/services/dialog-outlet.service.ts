import { Injectable } from '@angular/core';
import { ComponentType } from '@angular/cdk/portal';

import { MatDialogConfig } from '@angular/material/dialog';

import { Observable } from 'rxjs';

export interface ModuleWithComponent<T> {
    getComponent?: () => ComponentType<T>;
    getComponentId?: () => string;
}

@Injectable({ providedIn: 'root' })
export abstract class DialogOutletService<DialogType, DataType, ReturnType> {
    abstract open(module: ModuleWithComponent<DialogType>, data: MatDialogConfig<DataType>): Observable<ReturnType>;
}
