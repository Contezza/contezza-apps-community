import { Injectable } from '@angular/core';

import { DialogComponentService } from '@contezza/core/dialogs';

import { DynamicFormDialogComponent } from './dynamic-form-dialog.component';
import { DynamicFormDialogData } from './dynamic-form-dialog-data.interface';

@Injectable({ providedIn: 'root' })
export class DynamicFormDialogService<ReturnType = any> extends DialogComponentService<DynamicFormDialogComponent, DynamicFormDialogData, ReturnType> {
    protected get module() {
        return import('./dynamic-form-dialog.module');
    }
}
