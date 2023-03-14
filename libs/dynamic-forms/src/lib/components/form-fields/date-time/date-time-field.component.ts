import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { DatetimeAdapter, MAT_DATETIME_FORMATS } from '@mat-datetimepicker/core';
import { MAT_MOMENT_DATETIME_FORMATS, MomentDatetimeAdapter } from '@mat-datetimepicker/moment';

import { takeUntil } from 'rxjs/operators';

import { MomentDateAdapter, UserPreferencesService, UserPreferenceValues } from '@alfresco/adf-core';

import { DestroyService } from '@contezza/core/services';

import { Moment } from 'moment';

import { ContezzaBaseFieldComponent } from '../base-field.component';
import { DATE_FORMATS } from '../../../interfaces/date-formats.interface';

@Component({
    selector: 'contezza-date-time-field',
    templateUrl: './date-time-field.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: DateAdapter, useClass: MomentDateAdapter },
        { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS },
        { provide: DatetimeAdapter, useClass: MomentDatetimeAdapter },
        { provide: MAT_DATETIME_FORMATS, useValue: MAT_MOMENT_DATETIME_FORMATS },
    ],
})
export class DateTimeFieldComponent extends ContezzaBaseFieldComponent<Moment> implements OnInit {
    constructor(private readonly dateAdapter: DateAdapter<Moment>, private readonly userPreferencesService: UserPreferencesService, destroy$: DestroyService) {
        super(destroy$);
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.userPreferencesService
            .select(UserPreferenceValues.Locale)
            .pipe(takeUntil(this.destroy$))
            .subscribe((locale) => {
                this.dateAdapter.setLocale(locale);
            });
    }
}
