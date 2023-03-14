import { MomentDateAdapter, UserPreferencesService, UserPreferenceValues } from '@alfresco/adf-core';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { FormControl, FormGroup } from '@angular/forms';

import { DatetimeAdapter, MAT_DATETIME_FORMATS } from '@mat-datetimepicker/core';
import { MAT_MOMENT_DATETIME_FORMATS, MomentDatetimeAdapter } from '@mat-datetimepicker/moment';

import { Moment } from 'moment';

import { distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { DestroyService } from '@contezza/core/services';
import { DateRange } from '@contezza/core/utils';

import { DATE_FORMATS } from '../../../interfaces/date-formats.interface';
import { ContezzaBaseFieldComponent } from '../base-field.component';

@Component({
    selector: 'contezza-date-tange-single-field',
    templateUrl: './date-range-single-field.component.html',
    styleUrls: ['./date-range-single-field.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: DateAdapter, useClass: MomentDateAdapter },
        { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS },
        { provide: DatetimeAdapter, useClass: MomentDatetimeAdapter },
        { provide: MAT_DATETIME_FORMATS, useValue: MAT_MOMENT_DATETIME_FORMATS },
    ],
})
export class DateRangeSingleFieldComponent extends ContezzaBaseFieldComponent<DateRange> implements OnInit {
    fromSubcontrol = new FormControl(undefined);
    toSubcontrol = new FormControl(undefined);
    group = new FormGroup({ from: this.fromSubcontrol, to: this.toSubcontrol });

    constructor(private readonly dateAdapter: DateAdapter<Moment>, private readonly userPreferencesService: UserPreferencesService, destroy$: DestroyService) {
        super(destroy$);
    }

    ngOnInit(): void {
        super.ngOnInit();

        this.userPreferencesService
            .select(UserPreferenceValues.Locale)
            .pipe(takeUntil(this.destroy$))
            .subscribe((locale) => this.dateAdapter.setLocale(locale));

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
