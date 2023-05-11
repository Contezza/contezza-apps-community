import { MomentDateAdapter, UserPreferencesService, UserPreferenceValues } from '@alfresco/adf-core';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';

import moment, { Moment } from 'moment';

import { Observable, of } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

import { DestroyService } from '@contezza/core/services';
import { DATE_FORMATS } from '@contezza/core/utils';

import { ContezzaBaseFieldComponent } from '../base-field.component';

@Component({
    selector: 'contezza-date-field',
    templateUrl: './date-field.component.html',
    styleUrls: ['./date-field.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        // ideally we provide these in CommonModule, but Alfresco CoreModule injects NativeDateAdapter
        { provide: DateAdapter, useClass: MomentDateAdapter },
        { provide: MAT_DATE_FORMATS, useExisting: DATE_FORMATS },
    ],
})
export class DateFieldComponent extends ContezzaBaseFieldComponent<Moment> implements OnInit {
    min$: Observable<Moment>;
    max$: Observable<Moment>;

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

        this.min$ = this.field.extras?.min.pipe(map((date) => moment(date))) || of(undefined);
        this.max$ = this.field.extras?.max.pipe(map((date) => moment(date))) || of(undefined);
    }
}
