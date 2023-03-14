import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { TranslateModule } from '@ngx-translate/core';

import { CoreModule } from '@alfresco/adf-core';

import { ContezzaLetModule } from '@contezza/core/directives';
import { ContezzaDynamicFormExtensionService } from '@contezza/dynamic-forms/shared';

import { ButtonToggleFieldComponent } from './button-toggle-field.component';
import { ContezzaDynamicFormsCommonModule } from '../../../dynamic-forms.common.module';

@NgModule({
    imports: [CommonModule, CoreModule, ContezzaDynamicFormsCommonModule, ContezzaLetModule, MatButtonToggleModule, MatFormFieldModule, MatInputModule, TranslateModule],
    declarations: [ButtonToggleFieldComponent],
    exports: [ButtonToggleFieldComponent],
})
export class ContezzaButtonToggleFieldModule {
    constructor(extensions: ContezzaDynamicFormExtensionService) {
        extensions.setFieldComponents({
            'button-toggle': ButtonToggleFieldComponent,
            'button-toggle-multiple': ButtonToggleFieldComponent,
        });
    }
}
