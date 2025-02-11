import { NgModule } from '@angular/core';

import { ContezzaDynamicFormExtensionService } from '@contezza/dynamic-forms/shared';

@NgModule({})
export class UploadFieldModule {
    constructor(extensions: ContezzaDynamicFormExtensionService) {
        extensions.setFieldComponents({ upload: () => import('./upload.field.component').then((_) => _.UploadFieldComponent) });
    }
}
