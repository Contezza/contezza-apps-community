import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { User } from '@alfresco/adf-core';
import { Group } from '@alfresco/js-api';

// import { ContezzaPeopleGroupPickerComponent } from '@contezza/people-group-picker';
import { ContezzaDynamicFormExtensionService } from '@contezza/dynamic-forms/shared';
import { DestroyService } from '@contezza/core/services';

import { ContezzaBaseFieldComponent } from '../base-field.component';
import { ContezzaPeopleGroupPickerComponent } from '@contezza/people-group-picker';

@Component({
    selector: 'contezza-people-group-picker-field',
    standalone: true,
    imports: [CommonModule, ContezzaPeopleGroupPickerComponent],
    template: `
        <contezza-people-group-picker
            [pickerType]="(field.extras?.pickerType | async) || 'people-group'"
            [selectedItems]="selectedItems$ | async"
            peoplePlaceholder="APP.PEOPLE_GROUP_PICKER.PEOPLE.PLACEHOLDER"
            groupPlaceholder="APP.PEOPLE_GROUP_PICKER.GROUP.PLACEHOLDER"
            (onItemsChange)="onItemsChange($event)"
        >
        </contezza-people-group-picker>
    `,
})
export class PeopleGroupPickerFieldComponent<BaseValueType extends User | Group> extends ContezzaBaseFieldComponent<BaseValueType, BaseValueType[]> implements OnInit {
    selectedItems$: Observable<BaseValueType[]>;

    constructor(extensions: ContezzaDynamicFormExtensionService, destroy$: DestroyService) {
        super(destroy$);
        extensions.setFieldComponents({
            peoplePicker: PeopleGroupPickerFieldComponent,
        });
    }

    ngOnInit() {
        super.ngOnInit();
        this.selectedItems$ = this.control.valueChanges.pipe(
            startWith(this.control.value),
            map((value) => value || [])
        );
    }

    onItemsChange(items: any) {
        this.control.setValue(items?.length ? items : null);
    }
}
