import { Injectable } from '@angular/core';
import { MatDialogConfig } from '@angular/material/dialog';

import { Observable } from 'rxjs';

import { DialogComponentService } from '@contezza/core/dialogs';

import { MultiDynamicFormDialogData } from '@contezza/dynamic-forms/shared';

@Injectable({ providedIn: 'root' })
export class MultiDynamicFormDialogService<ReturnType = any> extends DialogComponentService<{ data: MultiDynamicFormDialogData }, MultiDynamicFormDialogData, ReturnType> {
    protected get module() {
        return import('@contezza/dynamic-forms').then((lib) => ({ module: { getComponent: () => lib.MultiDynamicFormDialogComponent } }));
    }

    open<TResponse = ReturnType>(data: MatDialogConfig<MultiDynamicFormDialogData>): Observable<TResponse | undefined> {
        return super.open(data) as any;
    }
}
