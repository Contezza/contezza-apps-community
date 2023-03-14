import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { TranslateModule } from '@ngx-translate/core';

import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { ContezzaDynamicFormExtensionService } from '@contezza/dynamic-forms/shared';

import { ChipsInputFieldComponent } from './chips-input-field.component';
import { ContezzaDynamicFormsCommonModule } from '../../../dynamic-forms.common.module';

@NgModule({
    imports: [CommonModule, ContezzaDynamicFormsCommonModule, MatButtonModule, MatChipsModule, MatIconModule, MatInputModule, ReactiveFormsModule, TranslateModule],
    declarations: [ChipsInputFieldComponent],
    exports: [ChipsInputFieldComponent],
})
export class ContezzaChipsInputFieldModule {
    constructor(extensions: ContezzaDynamicFormExtensionService) {
        extensions.setFieldComponents({
            chipsInput: ChipsInputFieldComponent,
        });
    }
}
