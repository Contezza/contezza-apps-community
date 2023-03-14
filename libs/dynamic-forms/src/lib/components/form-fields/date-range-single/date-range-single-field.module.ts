import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';

import { TranslateModule } from '@ngx-translate/core';

import { ContezzaDynamicFormExtensionService } from '@contezza/dynamic-forms/shared';

import { DateRangeSingleFieldComponent } from './date-range-single-field.component';
import { ContezzaDynamicFormsCommonModule } from '../../../dynamic-forms.common.module';

@NgModule({
    imports: [CommonModule, ContezzaDynamicFormsCommonModule, MatButtonModule, MatDatepickerModule, MatIconModule, MatInputModule, ReactiveFormsModule, TranslateModule],
    declarations: [DateRangeSingleFieldComponent],
    exports: [DateRangeSingleFieldComponent],
})
export class ContezzaDateRangeSingleFieldModule {
    constructor(extensions: ContezzaDynamicFormExtensionService) {
        extensions.setFieldComponents({
            dateRangeSingle: DateRangeSingleFieldComponent,
        });
    }
}
