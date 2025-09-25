import { ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';
import { MomentDateAdapter } from '@angular/material-moment-adapter';

import moment, { Moment } from 'moment';

import { Observable, of } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

import { UserPreferencesService, UserPreferenceValues } from '@alfresco/adf-core';

import { DestroyService } from '@contezza/core/services';
import { DATE_FORMATS } from '@contezza/core/utils';

import { ContezzaDynamicForm } from '@contezza/dynamic-forms/shared';

import { ContezzaBaseFieldComponent } from '../base-field.component';

@Component({
    standalone: false,
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

    @ViewChild('input', { static: true })
    input!: ElementRef;

    @ViewChild(MatDatepicker, { static: true })
    picker!: MatDatepicker<any>;

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

        this.min$ = this.field.extras?.min?.pipe(map((date) => moment(date))) || of(undefined);
        this.max$ = this.field.extras?.max?.pipe(map((date) => moment(date))) || of(undefined);

        // if the picker is open when the form-field value is initialised,
        // then close and re-open it
        // this happens e.g. with openPickerOnFocus=true in a dialog with autoFocus=true
        ContezzaDynamicForm.getValueSource(this.field)
            ?.pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                const isOpened = this.picker.opened;
                if (isOpened) {
                    this.picker.close();
                    setTimeout(() => this.picker.open(), 0);
                }
            });
    }

    onInputClick() {
        // trigger focus behaviour on click if the element is already focused
        if (document.activeElement === this.input.nativeElement) {
            this.onInputFocus();
        }
    }

    onInputFocus() {
        if (this.field.settings?.openPickerOnFocus) {
            this.picker.open();
        }
    }
}
