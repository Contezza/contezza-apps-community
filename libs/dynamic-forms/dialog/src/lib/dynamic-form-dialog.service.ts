import { Injectable } from '@angular/core';
import { MatDialogConfig } from '@angular/material/dialog';

import { Observable } from 'rxjs';

import { DialogComponentService } from '@contezza/core/dialogs';

import { DynamicFormDialogData } from '@contezza/dynamic-forms/shared';

@Injectable({ providedIn: 'root' })
export class DynamicFormDialogService<ReturnType = any> extends DialogComponentService<{ data: DynamicFormDialogData }, DynamicFormDialogData, ReturnType> {
    protected get module() {
        return import('@contezza/dynamic-forms').then((lib) => ({ module: { getComponent: () => lib.DynamicFormDialogComponent } }));
    }

    open<TResponse = ReturnType>(data: MatDialogConfig<DynamicFormDialogData>): Observable<TResponse | undefined> {
        return super.open(data) as any;
    }
}
