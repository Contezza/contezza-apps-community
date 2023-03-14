import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CommonModule } from '@angular/common';

import { TranslateModule } from '@ngx-translate/core';

import { ContezzaDynamicFormExtensionService } from '@contezza/dynamic-forms/shared';

import { CheckboxFieldComponent } from './checkbox-field.component';
import { ContezzaLetModule } from '@contezza/core/directives';

@NgModule({
    imports: [CommonModule, ContezzaLetModule, MatCheckboxModule, ReactiveFormsModule, TranslateModule],
    declarations: [CheckboxFieldComponent],
    exports: [CheckboxFieldComponent],
})
export class ContezzaCheckboxFieldModule {
    constructor(extensions: ContezzaDynamicFormExtensionService) {
        extensions.setFieldComponents({
            checkbox: CheckboxFieldComponent,
        });
    }
}
