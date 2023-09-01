import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ContezzaDynamicFormExtensionService } from '@contezza/dynamic-forms/shared';

import { ContezzaDynamicFormComponent } from '../../dynamic-form';
import { SubformFieldComponent } from './subform-field.component';

@NgModule({
    imports: [CommonModule, ContezzaDynamicFormComponent, MatProgressSpinnerModule],
    declarations: [SubformFieldComponent],
    exports: [SubformFieldComponent],
})
export class ContezzaSubformFieldModule {
    constructor(extensions: ContezzaDynamicFormExtensionService) {
        extensions.setFieldComponents({
            subform: SubformFieldComponent,
        });
    }
}
