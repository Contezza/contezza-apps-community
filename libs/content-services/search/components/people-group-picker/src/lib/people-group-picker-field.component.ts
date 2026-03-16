import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import { map, Observable, startWith } from 'rxjs';

import { User } from '@alfresco/adf-core';
import { Group } from '@alfresco/js-api';

import { ContezzaBaseFieldComponent } from '@contezza/dynamic-forms';

import { ContezzaPeopleGroupPickerComponent } from './people-group-picker.component';

@Component({
    standalone: true,
    imports: [CommonModule, ContezzaPeopleGroupPickerComponent],
    selector: 'contezza-people-group-picker-field',
    template: `
        <contezza-people-group-picker
            [pickerType]="(field.extras?.pickerType | async) || 'people-group'"
            [selectedItems]="selectedItems$ | async"
            peoplePlaceholder="APP.PEOPLE_GROUP_PICKER.PEOPLE.PLACEHOLDER"
            groupPlaceholder="APP.PEOPLE_GROUP_PICKER.GROUP.PLACEHOLDER"
            (onItemsChange)="onItemsChange($event)"
        />
    `,
})
export class PeopleGroupPickerFieldComponent<BaseValueType extends User | Group> extends ContezzaBaseFieldComponent<BaseValueType, BaseValueType[]> implements OnInit {
    selectedItems$: Observable<BaseValueType[]>;

    ngOnInit() {
        super.ngOnInit();
        this.selectedItems$ = this.control.valueChanges.pipe(
            startWith(this.control.value),
            map(value => value || []),
        );
    }

    onItemsChange(items: any) {
        this.control.setValue(items?.length ? items : null);
    }
}
