import { NgModule } from '@angular/core';

import { ContezzaDynamicFormExtensionService } from '@contezza/dynamic-forms/shared';

import { RadioButtonFieldComponent } from './radio-button.field.component';

@NgModule({})
export class ContezzaRadioButtonFieldModule {
    constructor(extensions: ContezzaDynamicFormExtensionService) {
        extensions.setFieldComponents({
            'radio-button': RadioButtonFieldComponent,
        });
    }
}
