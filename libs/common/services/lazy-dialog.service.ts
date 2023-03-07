import { Directive } from '@angular/core';
import { ComponentType } from '@angular/cdk/portal';
import { MatDialogConfig } from '@angular/material/dialog';

import { from, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

export interface ModuleWithComponent<T> {
    getComponent?: () => ComponentType<T>;
    getComponentId?: () => string;
}

export abstract class BaseDialogService<DialogType, DataType, ReturnType> {
    abstract open(module: ModuleWithComponent<DialogType>, data: MatDialogConfig<DataType>): Observable<ReturnType>;
}

@Directive()
// eslint-disable-next-line @angular-eslint/directive-class-suffix
export abstract class LazyDialogService<DialogType, DataType, ReturnType> {
    // getter instead of property to ensure lazyness
    protected abstract get module(): Promise<Record<any, ModuleWithComponent<DialogType>>>;

    protected constructor(private readonly dialog: BaseDialogService<DialogType, DataType, ReturnType>) {}

    open(data: MatDialogConfig<DataType>): Observable<ReturnType | undefined> {
        return from(this.module).pipe(switchMap((m) => this.dialog.open(Object.values(m)[0], data)));
    }
}
