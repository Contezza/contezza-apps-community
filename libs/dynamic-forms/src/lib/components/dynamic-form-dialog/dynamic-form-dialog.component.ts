import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

import { TranslateModule } from '@ngx-translate/core';

import { DialogTitleComponent } from '@contezza/core/dialogs';
import { DynamicFormDialogData } from '@contezza/dynamic-forms/shared';

import { ContezzaDynamicFormModule } from '../dynamic-form';

@Component({
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatDialogModule, TranslateModule, DialogTitleComponent, ContezzaDynamicFormModule],
    selector: 'contezza-dynamic-form-dialog',
    templateUrl: './dynamic-form-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicFormDialogComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public data: DynamicFormDialogData) {}
}
