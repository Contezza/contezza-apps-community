import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { TranslateModule } from '@ngx-translate/core';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { ContezzaDynamicFormExtensionService } from '@contezza/dynamic-forms/shared';

import { InputMaskModule } from '@ngneat/input-mask';

import { InputFieldComponent } from './input-field.component';
import { ContezzaDynamicFormsCommonModule } from '../../../dynamic-forms.common.module';

@NgModule({
    imports: [CommonModule, ContezzaDynamicFormsCommonModule, InputMaskModule.forRoot(), MatButtonModule, MatIconModule, MatInputModule, ReactiveFormsModule, TranslateModule],
    declarations: [InputFieldComponent],
    exports: [InputFieldComponent],
})
export class ContezzaInputFieldModule {
    constructor(extensions: ContezzaDynamicFormExtensionService) {
        extensions.setFieldComponents({
            input: InputFieldComponent,
            text: InputFieldComponent,
            long: InputFieldComponent,
            int: InputFieldComponent,
            integer: InputFieldComponent,
        });
    }
}
