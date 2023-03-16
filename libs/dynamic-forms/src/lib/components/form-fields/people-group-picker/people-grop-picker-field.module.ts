import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ContezzaDynamicFormExtensionService } from '@contezza/dynamic-forms/shared';
import { ContezzaPeopleGroupPickerComponent } from '@contezza/people-group-picker';
import { PeopleGroupPickerFieldComponent } from './people-group-picker-field.component';

@NgModule({
    imports: [CommonModule, ContezzaPeopleGroupPickerComponent],
    declarations: [PeopleGroupPickerFieldComponent],
    exports: [PeopleGroupPickerFieldComponent],
})
export class ContezzaPeopleGroupPickerFieldModule {
    constructor(extensions: ContezzaDynamicFormExtensionService) {
        extensions.setFieldComponents({
            peoplePicker: PeopleGroupPickerFieldComponent,
        });
    }
}
