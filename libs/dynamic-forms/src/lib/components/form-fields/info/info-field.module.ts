import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatIconModule } from '@angular/material/icon';

import { TranslateModule } from '@ngx-translate/core';

import { ContezzaDynamicFormExtensionService } from '@contezza/dynamic-forms/shared';

import { InfoFieldComponent } from './info-field.component';

@NgModule({
    imports: [CommonModule, MatIconModule, TranslateModule],
    declarations: [InfoFieldComponent],
    exports: [InfoFieldComponent],
})
export class ContezzaInfoFieldModule {
    constructor(extensions: ContezzaDynamicFormExtensionService) {
        extensions.setFieldComponents({
            info: InfoFieldComponent,
        });
    }
}
