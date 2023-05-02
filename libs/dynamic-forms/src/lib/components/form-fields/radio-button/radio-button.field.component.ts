import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { TranslateModule } from '@ngx-translate/core';

import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, startWith, tap } from 'rxjs/operators';

import { IconModule } from '@alfresco/adf-core';

import { ContezzaLetModule } from '@contezza/core/directives';
import { ContezzaDisplayableValue, ContezzaDynamicForm } from '@contezza/dynamic-forms/shared';

import { ContezzaDynamicFormFieldErrorModule } from '../../dynamic-form-field-error';
import { ContezzaBaseFieldComponent } from '../base-field.component';

@Component({
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatRadioModule,
        TranslateModule,
        IconModule,
        ContezzaLetModule,
        ContezzaDynamicFormFieldErrorModule,
    ],
    selector: 'contezza-radio-button-field',
    templateUrl: './radio-button.field.component.html',
    styleUrls: [`./radio-button.field.component.scss`],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadioButtonFieldComponent<BaseValueType> extends ContezzaBaseFieldComponent<BaseValueType> implements OnInit {
    selectableOptions$: Observable<ContezzaDisplayableValue<BaseValueType>[]>;

    private readonly optionsLoadingSource = new BehaviorSubject<boolean>(false);
    readonly optionsLoading$: Observable<boolean> = this.optionsLoadingSource.asObservable();

    ngOnInit() {
        super.ngOnInit();
        this.initializeOptions();
    }

    protected initializeOptions() {
        const loadedOptions: Observable<ContezzaDisplayableValue<BaseValueType>[]> = this.field.options.filterLoadingValues(this.optionsLoadingSource);

        // TODO: every time the following flow changes, check impact in:
        // version selection in 'register object'
        // iot direction selection in postintake
        this.selectableOptions$ = combineLatest([
            // startWith to trigger the flow, otherwise no option is shown
            this.control.valueChanges.pipe(
                startWith(this.control.value),
                // prevent a self-loop
                distinctUntilChanged(),
                distinctUntilChanged((oldValue, newValue) => {
                    // excluding trivial cases
                    if ((!oldValue && newValue) || (oldValue && !newValue) || ((typeof oldValue !== 'object' || typeof newValue !== 'object') && oldValue !== newValue)) {
                        return false;
                    }
                    return Object.keys(oldValue).every((key) => oldValue[key] === newValue[key]);
                })
            ),
            combineLatest([loadedOptions.pipe(tap(() => this.initializeValue())), ContezzaDynamicForm.getValueSource(this.field)])
                .pipe(map(([options]) => options))
                .pipe(
                    tap((options) => {
                        // if only one option exists and the field is required, then that option is selected and the field disabled
                        if (this.required) {
                            if (options?.length === 1) {
                                this.control.setValue(options[0]);
                                this.readonly = true;
                            } else {
                                this.readonly = false;
                            }
                        }
                    })
                ),
        ]).pipe(
            // let value and options wait for each other
            debounceTime(0),
            // if a new value comes, then look for a match with the options
            // if a new list of options comes, then the selection must reset
            tap(([value, options]) => {
                // we use the readonly property to check if the selection has been set in the previous tap
                if (!this.readonly && value && typeof value === 'object') {
                    const matchingValue = this.findMatchingValue(value, options);
                    if (!this.optionsLoadingSource.value) {
                        // only change the value if the options are loaded
                        this.control.setValue(matchingValue);
                    }
                }
            }),
            map(([_, options]) => options)
        );
    }
}
