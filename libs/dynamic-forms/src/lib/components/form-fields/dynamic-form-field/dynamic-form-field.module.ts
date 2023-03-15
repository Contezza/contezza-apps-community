import { NgModule } from '@angular/core';

import { DynamicFormFieldComponent } from './dynamic-form-field.component';
import { ContezzaAutocompleteFieldModule } from '../autocomplete/autocomplete-field.module';
import { ContezzaButtonToggleFieldModule } from '../button-toggle/button-toggle-field.module';
import { ContezzaCheckboxFieldModule } from '../checkbox/checkbox-field.module';
import { ContezzaChipsInputFieldModule } from '../chips-input/chips-input-field.module';
import { ContezzaDateFieldModule } from '../date/date-field.module';
import { ContezzaDateTimeFieldModule } from '../date-time/date-time-field.module';
import { ContezzaInputFieldModule } from '../input/input-field.module';
import { ContezzaSelectFieldModule } from '../select/select-field.module';
import { ContezzaTextareaFieldModule } from '../textarea/textarea-field.module';
import { DynamicFormFieldDirective } from './dynamic-form-field.directive';
import { ContezzaMultiautocompleteFieldModule } from '../multiautocomplete/multiautocomplete-field.module';
import { ContezzaInputDialogFieldModule } from '../input-dialog/input-dialog-field.module';
import { ContezzaToggleFieldModule } from '../toggle/toggle-field.module';
import { ContezzaDateRangeFieldModule } from '../date-range/date-range-field.module';
import { ContezzaInfoFieldModule } from '../info/info-field.module';
import { ContezzaDateRangeChipFieldModule } from '../date-range-chip/date-range-chip-field.module';
import { ContezzaDateRangeSingleFieldModule } from '../date-range-single/date-range-single-field.module';
import { PeopleGroupPickerFieldComponent } from '../people-group-picker/people-group-picker-field.component';

@NgModule({
    imports: [
        ContezzaAutocompleteFieldModule,
        ContezzaButtonToggleFieldModule,
        ContezzaCheckboxFieldModule,
        ContezzaChipsInputFieldModule,
        ContezzaDateFieldModule,
        ContezzaDateRangeSingleFieldModule,
        ContezzaDateRangeFieldModule,
        ContezzaDateRangeChipFieldModule,
        ContezzaDateTimeFieldModule,
        ContezzaInfoFieldModule,
        ContezzaInputFieldModule,
        ContezzaInputDialogFieldModule,
        ContezzaMultiautocompleteFieldModule,
        ContezzaSelectFieldModule,
        ContezzaTextareaFieldModule,
        ContezzaToggleFieldModule,
        PeopleGroupPickerFieldComponent,
    ],
    declarations: [DynamicFormFieldComponent, DynamicFormFieldDirective],
    exports: [DynamicFormFieldComponent, DynamicFormFieldDirective],
})
export class ContezzaDynamicFormFieldModule {}
