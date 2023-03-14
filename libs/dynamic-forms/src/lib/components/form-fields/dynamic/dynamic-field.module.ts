import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ContezzaDynamicFormExtensionService } from '@contezza/dynamic-forms/shared';

import { DynamicFieldComponent } from './dynamic-field.component';
import { ContezzaDynamicFormFieldModule } from '../../dynamic-form-field';

@NgModule({
    imports: [CommonModule, ContezzaDynamicFormFieldModule, MatProgressSpinnerModule],
    declarations: [DynamicFieldComponent],
    exports: [DynamicFieldComponent],
})
export class ContezzaDynamicFieldModule {
    constructor(extensions: ContezzaDynamicFormExtensionService) {
        extensions.setFieldComponents({
            dynamic: DynamicFieldComponent,
        });
    }
}
