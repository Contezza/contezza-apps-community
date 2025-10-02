import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

import { TranslateModule } from '@ngx-translate/core';

import { DialogTitleComponent } from '@contezza/core/dialogs';

import { ContezzaDynamicFormModule } from '../dynamic-form';
import { MultiDynamicFormShellComponent, Settings, Step } from '../multi-dynamic-form-shell';

import { DynamicFormItemGroup, MultiDynamicFormDialogData } from '@contezza/dynamic-forms/shared';

@Component({
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatDialogModule, TranslateModule, DialogTitleComponent, ContezzaDynamicFormModule, MultiDynamicFormShellComponent],
    selector: 'contezza-multi-dynamic-form-dialog',
    templateUrl: './multi-dynamic-form-dialog.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiDynamicFormDialogComponent {
    readonly settings: Settings = { steps: [Step.Fill] };
    groups: DynamicFormItemGroup[] = [];

    constructor(@Inject(MAT_DIALOG_DATA) public data: MultiDynamicFormDialogData) {
        this.groups = [{ id: 'multi-dynamic-form', title: typeof data.title === 'string' ? data.title : data.title.label, columns: data.columns, items: data.items }];
    }
}
