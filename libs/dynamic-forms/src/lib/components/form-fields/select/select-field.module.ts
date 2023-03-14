import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';

import { TranslateModule } from '@ngx-translate/core';

import { IconModule } from '@alfresco/adf-core';

import { ContezzaLetModule } from '@contezza/core/directives';
import { ContezzaDynamicFormExtensionService } from '@contezza/dynamic-forms/shared';

import { SelectFieldComponent } from './select-field.component';
import { ContezzaDynamicFormsCommonModule } from '../../../dynamic-forms.common.module';

@NgModule({
    imports: [
        CommonModule,
        ContezzaDynamicFormsCommonModule,
        ContezzaLetModule,
        IconModule,
        MatButtonModule,
        MatCheckboxModule,
        MatDividerModule,
        MatIconModule,
        MatSelectModule,
        ReactiveFormsModule,
        TranslateModule,
    ],
    declarations: [SelectFieldComponent],
    exports: [SelectFieldComponent],
})
export class ContezzaSelectFieldModule {
    constructor(extensions: ContezzaDynamicFormExtensionService) {
        extensions.setFieldComponents({
            select: SelectFieldComponent,
            multiselect: SelectFieldComponent,
        });
    }
}
