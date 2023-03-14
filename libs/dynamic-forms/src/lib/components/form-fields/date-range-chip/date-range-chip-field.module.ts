import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';

import { TranslateModule } from '@ngx-translate/core';

import { SearchModule } from '@alfresco/adf-content-services';

import { ContezzaDynamicFormExtensionService } from '@contezza/dynamic-forms/shared';
import { ContezzaLetModule } from '@contezza/core/directives';

import { ContezzaDateFieldModule } from '../date/date-field.module';
import { DateRangeChipFieldComponent } from './date-range-chip-field.component';

@NgModule({
    imports: [
        CommonModule,
        ContezzaDateFieldModule,
        MatFormFieldModule,
        TranslateModule,
        MatChipsModule,
        MatMenuModule,
        SearchModule,
        MatIconModule,
        MatButtonModule,
        MatDividerModule,
        ContezzaLetModule,
    ],
    declarations: [DateRangeChipFieldComponent],
    exports: [DateRangeChipFieldComponent],
})
export class ContezzaDateRangeChipFieldModule {
    constructor(extensions: ContezzaDynamicFormExtensionService) {
        extensions.setFieldComponents({
            dateRangeChip: DateRangeChipFieldComponent,
        });
    }
}
