import { NgModule } from '@angular/core';

import { ContezzaDynamicFormExtensionService } from '@contezza/dynamic-forms/shared';

@NgModule({})
export class SubformFieldModule {
    constructor(extensions: ContezzaDynamicFormExtensionService) {
        extensions.setFieldComponents({ subform: () => import('./subform.field.component').then((m) => m.SubformFieldComponent) });
    }
}
