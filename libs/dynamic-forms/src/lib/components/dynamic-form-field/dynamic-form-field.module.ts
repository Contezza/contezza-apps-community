import { NgModule } from '@angular/core';

import { DynamicFormFieldComponent } from './dynamic-form-field.component';
import { ContezzaAutocompleteFieldModule } from '../form-fields/autocomplete/autocomplete-field.module';
import { ContezzaButtonToggleFieldModule } from '../form-fields/button-toggle/button-toggle-field.module';
import { ContezzaCheckboxFieldModule } from '../form-fields/checkbox/checkbox-field.module';
import { ContezzaChipsInputFieldModule } from '../form-fields/chips-input/chips-input-field.module';
import { ContezzaDateFieldModule } from '../form-fields/date/date-field.module';
import { ContezzaDateTimeFieldModule } from '../form-fields/date-time/date-time-field.module';
import { ContezzaInputFieldModule } from '../form-fields/input/input-field.module';
import { ContezzaSelectFieldModule } from '../form-fields/select/select-field.module';
import { ContezzaTextareaFieldModule } from '../form-fields/textarea/textarea-field.module';
import { DynamicFormFieldDirective } from './dynamic-form-field.directive';
import { ContezzaMultiautocompleteFieldModule } from '../form-fields/multiautocomplete/multiautocomplete-field.module';
import { ContezzaInputDialogFieldModule } from '../form-fields/input-dialog/input-dialog-field.module';
import { ContezzaToggleFieldModule } from '../form-fields/toggle/toggle-field.module';
import { ContezzaDateRangeFieldModule } from '../form-fields/date-range/date-range-field.module';
import { ContezzaInfoFieldModule } from '../form-fields/info/info-field.module';
import { ContezzaDateRangeChipFieldModule } from '../form-fields/date-range-chip/date-range-chip-field.module';
import { ContezzaDateRangeSingleFieldModule } from '../form-fields/date-range-single/date-range-single-field.module';
import { ContezzaPeopleGroupPickerFieldModule } from '../form-fields/people-group-picker/people-grop-picker-field.module';

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
        ContezzaPeopleGroupPickerFieldModule,
    ],
    declarations: [DynamicFormFieldComponent, DynamicFormFieldDirective],
    exports: [DynamicFormFieldComponent, DynamicFormFieldDirective],
})
export class ContezzaDynamicFormFieldModule {}
