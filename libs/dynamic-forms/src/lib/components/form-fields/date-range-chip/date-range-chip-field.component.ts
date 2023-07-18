import { ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { FormControl } from '@angular/forms';

import { Moment } from 'moment/moment';
import moment from 'moment';

import { combineLatest, Subject } from 'rxjs';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { ContezzaFormField } from '@contezza/dynamic-forms/shared';
import { DestroyService } from '@contezza/core/services';
import { DateRange } from '@contezza/core/utils';

import { ContezzaBaseFieldComponent } from '../base-field.component';

@Component({
    selector: 'contezza-date-range-chip-field',
    templateUrl: './date-range-chip-field.component.html',
    styleUrls: ['./date-range-chip-field.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateRangeChipFieldComponent extends ContezzaBaseFieldComponent<DateRange> implements OnInit {
    displayValue$ = new Subject<string>();

    @ViewChild('menuContainer', { static: false })
    menuContainer: ElementRef;

    @ViewChild('menuTrigger', { static: false })
    menuTrigger: MatMenuTrigger;

    fromSubfield: ContezzaFormField<Moment> = {
        id: 'from',
        type: 'date',
        label: 'APP.FORM_FIELDS.DATE_RANGE.FROM',
        settings: {},
    };
    fromSubcontrol: FormControl;
    toSubfield: ContezzaFormField<Moment> = {
        id: 'to',
        type: 'date',
        label: 'APP.FORM_FIELDS.DATE_RANGE.TO',
        settings: {},
    };
    toSubcontrol: FormControl;

    static DATE_FORMAT = 'DD-MM-YYYY';

    constructor(readonly destroy$: DestroyService) {
        super(destroy$);
    }
    ngOnInit(): void {
        super.ngOnInit();

        Object.assign(this.fromSubfield.settings, this.field.settings);
        Object.assign(this.toSubfield.settings, this.field.settings);

        // possibly dependent on field settings (e.g. add validators)
        this.fromSubcontrol = new FormControl(undefined);
        this.toSubcontrol = new FormControl(undefined);
        combineLatest([this.fromSubcontrol.valueChanges.pipe(distinctUntilChanged()), this.toSubcontrol.valueChanges.pipe(distinctUntilChanged())])
            .pipe(takeUntil(this.destroy$))
            .subscribe(([from, to]) => {
                if (this.fromSubcontrol.touched || this.toSubcontrol.touched) {
                    this.control.markAsTouched();
                }
                this.control.setValue({
                    from: from ?? null,
                    to: to ?? null,
                });
                this.updateDisplayValue(from, to);
            });

        this.control.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value: DateRange) => {
            this.fromSubcontrol.setValue(value?.from);
            this.toSubcontrol.setValue(value?.to);
        });

        this.fromSubcontrol.setValue(this.control.value?.from);
        this.toSubcontrol.setValue(this.control.value?.to);
        this.updateDisplayValue(this.control.value?.from, this.control.value?.to);
    }

    onRemove() {
        this.control.setValue({
            from: undefined,
            to: undefined,
        });
        this.menuTrigger.closeMenu();
    }

    onEnterKeydown(): void {
        this.menuTrigger.openMenu();
    }

    private updateDisplayValue(from: Moment, to: Moment): void {
        this.displayValue$.next(
            this.fromSubcontrol.valid && this.toSubcontrol.valid && (from || to)
                ? `${from ? moment(from).format(DateRangeChipFieldComponent.DATE_FORMAT) : '01-01-1000'} - ${
                      to ? moment(to).format(DateRangeChipFieldComponent.DATE_FORMAT) : '01-01-2100'
                  }`
                : ''
        );
    }
}

// JSON example
// {
//     "id": "vpd:assortmentConsolidation",
//     "type": "dateRangeChip",
//     "label": "Launch date",
//     "query": {
//     "map": {
//         "id": "dateRangeQuery",
//             "parameters": "vpd:launchDate"
//     }
// },
//     "settings": {
//     "appearance": "outline"
// }
// }
