import { NgModule } from '@angular/core';

import { ContezzaDynamicFormExtensionService } from '@contezza/dynamic-forms/shared';

import { InputFieldComponent } from './input-field.component';

@NgModule({})
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
