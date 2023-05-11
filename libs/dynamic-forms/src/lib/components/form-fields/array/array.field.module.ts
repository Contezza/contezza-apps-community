import { NgModule } from '@angular/core';

import { ContezzaDynamicFormExtensionService } from '@contezza/dynamic-forms/shared';

import { ArrayFieldComponent } from './array.field.component';

@NgModule({})
export class ArrayFieldModule {
    constructor(extensions: ContezzaDynamicFormExtensionService) {
        extensions.setFieldComponents({
            array: ArrayFieldComponent,
        });
    }
}
