import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ContezzaDynamicFormExtensionService } from '@contezza/dynamic-forms/shared';

import { DynamicFieldComponent } from './dynamic-field.component';
import { DynamicFormFieldComponent } from '../../dynamic-form-field/dynamic-form-field.component';

@NgModule({
    imports: [CommonModule, DynamicFormFieldComponent, MatProgressSpinnerModule],
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
