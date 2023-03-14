import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatDatetimepickerModule } from '@mat-datetimepicker/core';

import { TranslateModule } from '@ngx-translate/core';

import { ContezzaDynamicFormExtensionService } from '@contezza/dynamic-forms/shared';

import { DateTimeFieldComponent } from './date-time-field.component';
import { ContezzaDynamicFormsCommonModule } from '../../../dynamic-forms.common.module';

@NgModule({
    imports: [CommonModule, ContezzaDynamicFormsCommonModule, MatButtonModule, MatDatetimepickerModule, MatIconModule, MatInputModule, ReactiveFormsModule, TranslateModule],
    declarations: [DateTimeFieldComponent],
    exports: [DateTimeFieldComponent],
})
export class ContezzaDateTimeFieldModule {
    constructor(extensions: ContezzaDynamicFormExtensionService) {
        extensions.setFieldComponents({
            dateTime: DateTimeFieldComponent,
        });
    }
}
