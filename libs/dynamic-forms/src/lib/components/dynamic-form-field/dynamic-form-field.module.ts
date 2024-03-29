import { NgModule } from '@angular/core';

import { DynamicFormFieldComponent } from './dynamic-form-field.component';
import {
    ArrayFieldModule,
    ContezzaAutocompleteFieldModule,
    ContezzaButtonToggleFieldModule,
    ContezzaCheckboxFieldModule,
    ContezzaChipsInputFieldModule,
    ContezzaDateFieldModule,
    ContezzaDateRangeChipFieldModule,
    ContezzaDateRangeFieldModule,
    ContezzaDateRangeSingleFieldModule,
    ContezzaDateTimeFieldModule,
    ContezzaDynamicFieldModule,
    ContezzaInfoFieldModule,
    ContezzaInputDialogFieldModule,
    ContezzaInputFieldModule,
    ContezzaMultiautocompleteFieldModule,
    ContezzaPeopleGroupPickerFieldModule,
    ContezzaRadioButtonFieldModule,
    ContezzaSelectFieldModule,
    ContezzaTextareaFieldModule,
    ContezzaToggleFieldModule,
    HelpFieldModule,
} from '../form-fields';
import { DialogFieldModule } from '../form-fields/dialog/dialog.field.module';
import { SearchFieldModule } from '../form-fields/search/search.field.module';
import { SubformFieldModule } from '../form-fields/subform/subform.field.module';
import { VariableFieldModule } from '../form-fields/variable/variable.field.module';

@NgModule({
    imports: [
        ArrayFieldModule,
        ContezzaAutocompleteFieldModule,
        ContezzaButtonToggleFieldModule,
        ContezzaCheckboxFieldModule,
        ContezzaChipsInputFieldModule,
        ContezzaDateFieldModule,
        ContezzaDateRangeSingleFieldModule,
        ContezzaDateRangeFieldModule,
        ContezzaDateRangeChipFieldModule,
        ContezzaDateTimeFieldModule,
        ContezzaDynamicFieldModule,
        ContezzaInfoFieldModule,
        ContezzaInputFieldModule,
        ContezzaInputDialogFieldModule,
        ContezzaMultiautocompleteFieldModule,
        ContezzaRadioButtonFieldModule,
        ContezzaSelectFieldModule,
        ContezzaTextareaFieldModule,
        ContezzaToggleFieldModule,
        ContezzaPeopleGroupPickerFieldModule,
        DynamicFormFieldComponent,
        DialogFieldModule,
        HelpFieldModule,
        SearchFieldModule,
        SubformFieldModule,
        VariableFieldModule,
    ],
    exports: [DynamicFormFieldComponent],
})
export class ContezzaDynamicFormFieldModule {}
