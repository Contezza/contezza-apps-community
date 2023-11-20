import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { TranslateModule } from '@ngx-translate/core';

import { ContezzaDynamicFormExtensionService } from '@contezza/dynamic-forms/shared';

import { InputDialogFieldComponent } from './input-dialog-field.component';
import { ContezzaDynamicFormsCommonModule } from '../../../dynamic-forms.common.module';
import { InputFieldComponent } from '../input/input-field.component';

@NgModule({
    imports: [CommonModule, ContezzaDynamicFormsCommonModule, InputFieldComponent, MatButtonModule, MatIconModule, ReactiveFormsModule, TranslateModule],
    declarations: [InputDialogFieldComponent],
    exports: [InputDialogFieldComponent],
})
export class ContezzaInputDialogFieldModule {
    constructor(extensions: ContezzaDynamicFormExtensionService) {
        extensions.setFieldComponents({
            inputDialog: InputDialogFieldComponent,
        });
    }
}
