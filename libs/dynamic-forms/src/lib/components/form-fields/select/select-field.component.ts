import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';

import { BehaviorSubject, combineLatest, Observable, of, timer } from 'rxjs';
import { debounce, debounceTime, distinctUntilChanged, map, startWith, take, tap } from 'rxjs/operators';

import { ContezzaDisplayableValue, ContezzaDynamicForm } from '@contezza/dynamic-forms/shared';

import { ContezzaBaseFieldComponent } from '../base-field.component';

@Component({
    selector: 'contezza-select-field',
    templateUrl: 'select-field.component.html',
    styleUrls: ['select-field.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class SelectFieldComponent<BaseValueType, ValueType extends BaseValueType | BaseValueType[]> extends ContezzaBaseFieldComponent<BaseValueType, ValueType> implements OnInit {
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
                // apply debounceTime only on typing
                debounce((value) => (value && typeof value === 'string' ? timer(this.TYPING_DEBOUNCE_TIME) : of({}))),
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

    setAll(selected: boolean) {
        if (this.field.options && this.control) {
            if (selected) {
                this.field.options.pipe(take(1)).subscribe((options) => this.control.setValue(options));
            } else {
                this.control.setValue([]);
            }
        }
    }

    // without this the default value is (initialized but) not shown
    displayFn(attribute1, attribute2) {
        return JSON.stringify(attribute1) === JSON.stringify(attribute2) ? attribute1 : undefined;
    }
}
