import { NgModule } from '@angular/core';

import { ContezzaDynamicFormExtensionService } from '@contezza/dynamic-forms/shared';

@NgModule({})
export class SearchFieldModule {
    constructor(extensions: ContezzaDynamicFormExtensionService) {
        extensions.setFieldComponents({ search: () => import('./search.field.component').then((m) => m.SearchFieldComponent) });
    }
}
