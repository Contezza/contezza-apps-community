import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatFormFieldModule } from '@angular/material/form-field';

import { TranslateModule } from '@ngx-translate/core';

import { ContezzaLetDirective } from '@contezza/core/directives';
import { TranslatePropertyTitlePipe } from '@contezza/core/property-titles';
import { ContezzaDynamicFormExtensionService } from '@contezza/dynamic-forms/shared';

import { DateRangeFieldComponent } from './date-range-field.component';
import { ContezzaDateFieldModule } from '../date/date-field.module';
import { ContezzaDynamicFormsCommonModule } from '../../../dynamic-forms.common.module';

@NgModule({
    imports: [CommonModule, ContezzaDateFieldModule, MatFormFieldModule, TranslateModule, ContezzaLetDirective, TranslatePropertyTitlePipe, ContezzaDynamicFormsCommonModule],
    declarations: [DateRangeFieldComponent],
    exports: [DateRangeFieldComponent],
})
export class ContezzaDateRangeFieldModule {
    constructor(extensions: ContezzaDynamicFormExtensionService) {
        extensions.setFieldComponents({
            dateRange: DateRangeFieldComponent,
        });
    }
}
