import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { DynamicFormDialogData } from './dynamic-form-dialog-data.interface';

@Component({
    selector: 'contezza-dynamic-form-dialog',
    templateUrl: './dynamic-form-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicFormDialogComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public data: DynamicFormDialogData) {}
}
