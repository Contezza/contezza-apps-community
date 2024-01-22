import { NgModule } from '@angular/core';

import { ContezzaDynamicFormExtensionService } from '@contezza/dynamic-forms/shared';

@NgModule({})
export class VariableFieldModule {
    constructor(extensions: ContezzaDynamicFormExtensionService) {
        extensions.setFieldComponents({ variable: () => import('./variable.field.component').then((_) => _.VariableFieldComponent) });
    }
}
