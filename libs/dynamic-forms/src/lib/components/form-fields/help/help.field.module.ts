import { NgModule } from '@angular/core';

import { ContezzaDynamicFormExtensionService } from '@contezza/dynamic-forms/shared';

@NgModule({})
export class HelpFieldModule {
    constructor(extensions: ContezzaDynamicFormExtensionService) {
        extensions.setFieldComponents({ help: () => import('./help.field.component').then((m) => m.HelpFieldComponent) });
    }
}
