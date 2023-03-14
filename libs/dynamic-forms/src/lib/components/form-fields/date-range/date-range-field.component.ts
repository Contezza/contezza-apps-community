import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { Moment } from 'moment';

import { DateRange } from '@contezza/core/utils';
import { ContezzaFormField } from '@contezza/dynamic-forms/shared';

import { ContezzaBaseFieldComponent } from '../base-field.component';

@Component({
    selector: 'contezza-date-range-field',
    templateUrl: './date-range-field.component.html',
    styleUrls: ['./date-range-field.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateRangeFieldComponent extends ContezzaBaseFieldComponent<DateRange> implements OnInit {
    fromSubfield: ContezzaFormField<Moment> = {
        id: 'from',
        type: 'date',
        label: 'APP.FORM_FIELDS.DATE_RANGE.FROM',
        settings: {},
    };
    fromSubcontrol = new FormControl(undefined);
    toSubfield: ContezzaFormField<Moment> = {
        id: 'to',
        type: 'date',
        label: 'APP.FORM_FIELDS.DATE_RANGE.TO',
        settings: {},
    };
    toSubcontrol = new FormControl(undefined);
    group = new FormGroup({ from: this.fromSubcontrol, to: this.toSubcontrol });

    ngOnInit(): void {
        super.ngOnInit();

        // inherit 'protected' parameter
        Object.assign(this.fromSubfield.settings, this.field.settings);
        Object.assign(this.toSubfield.settings, this.field.settings);

        this.group.valueChanges
            .pipe(
                distinctUntilChanged((oldValue, newValue) => oldValue.from === newValue.from && oldValue.to === newValue.to),
                takeUntil(this.destroy$)
            )
            .subscribe((value) => {
                if (this.fromSubcontrol.touched || this.toSubcontrol.touched) {
                    this.control.markAsTouched();
                }
                this.control.setValue(value);
            });

        this.control.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value: DateRange) => {
            if (value) {
                this.group.patchValue(value);
            } else {
                this.group.reset();
            }
        });

        this.group.patchValue(this.control.value);
    }
}
