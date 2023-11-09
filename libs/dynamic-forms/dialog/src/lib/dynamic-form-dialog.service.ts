import { Injectable } from '@angular/core';

import { DialogComponentService } from '@contezza/core/dialogs';

import { DynamicFormDialogData } from '@contezza/dynamic-forms/shared';

@Injectable({ providedIn: 'root' })
export class DynamicFormDialogService<ReturnType = any> extends DialogComponentService<{ data: DynamicFormDialogData }, DynamicFormDialogData, ReturnType> {
    protected get module() {
        return import('@contezza/dynamic-forms').then((lib) => ({ module: { getComponent: () => lib.DynamicFormDialogComponent } }));
    }
}
