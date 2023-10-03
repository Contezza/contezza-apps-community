import { ChangeDetectionStrategy, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';

import { MatInput } from '@angular/material/input';
import { MatSelect, MatSelectChange } from '@angular/material/select';

import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, pairwise, pluck, startWith, tap } from 'rxjs/operators';

import { ContezzaDisplayableValue, ContezzaDynamicForm, ContezzaFormField } from '@contezza/dynamic-forms/shared';

import { ContezzaBaseFieldComponent } from '../base-field.component';

@Component({
    selector: 'contezza-multiautocomplete-field',
    templateUrl: './multiautocomplete-field.component.html',
    styleUrls: ['./multiautocomplete-field.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class MultiautocompleteFieldComponent<BaseValueType> extends ContezzaBaseFieldComponent<BaseValueType, BaseValueType[]> implements OnInit {
    selectAllOption?: ContezzaFormField['settings']['selectAllOption'];
    showSelectAllOption?: ContezzaFormField['settings']['showSelectAllOption'];
    selectableOptions$: Observable<ContezzaDisplayableValue<BaseValueType>[]>;

    private readonly optionsLoadingSource = new BehaviorSubject<boolean>(false);
    readonly optionsLoading$: Observable<boolean> = this.optionsLoadingSource.asObservable();

    subcontrol: FormControl<string>;

    @ViewChild(MatInput)
    input: MatInput;

    @ViewChild(MatSelect)
    select: MatSelect;

    ngOnInit() {
        super.ngOnInit();

        const subcontrolId: string = this.field.settings?.subcontrolId;
        this.subcontrol = subcontrolId ? (this.control.parent.get(subcontrolId) as FormControl<string>) : new FormControl('');
        this.initializeOptions();
    }

    protected initializeOptions() {
        const loadedOptions: Observable<ContezzaDisplayableValue<BaseValueType>[]> = this.field.options.filterLoadingValues(this.optionsLoadingSource);

        if (!this.field.settings?.preFilteredOptions) {
            this.showSelectAllOption = this.field.settings?.showSelectAllOption ?? true;
            this.selectableOptions$ = combineLatest([
                // startWith to trigger the flow, otherwise no option is shown
                this.subcontrol.valueChanges.pipe(startWith(this.subcontrol.value), debounceTime(this.TYPING_DEBOUNCE_TIME), distinctUntilChanged()),
                combineLatest([
                    this.control.valueChanges.pipe(
                        startWith(this.control.value),
                        // prevent a self-loop
                        distinctUntilChanged(),
                        distinctUntilChanged((oldValue, newValue) => {
                            // excluding trivial cases
                            if ((!oldValue && newValue) || (oldValue && !newValue) || oldValue.length !== newValue.length) {
                                return false;
                            }
                            return Object.keys(oldValue).every((index) => {
                                const oldItem = oldValue[index];
                                const newItem = newValue[index];
                                if ((!oldItem && newItem) || (oldItem && !newItem) || ((typeof oldItem !== 'object' || typeof newItem !== 'object') && oldItem !== newItem)) {
                                    return false;
                                }
                                if (!oldItem && !newItem) {
                                    return true;
                                }
                                return Object.keys(oldItem).every((key) => oldItem[key] === newItem[key]);
                            });
                        })
                    ),
                    combineLatest([
                        loadedOptions.pipe(
                            startWith(undefined),
                            pairwise(),
                            tap(([oldOptions, newOptions]) => {
                                if (oldOptions !== newOptions) {
                                    this.initializeValue();
                                }
                            }),
                            map(([, value]) => value)
                        ),
                        ContezzaDynamicForm.getValueSource(this.field),
                    ]).pipe(map(([options]) => options)),
                ]).pipe(
                    debounceTime(0),
                    // if a new value comes, then look for a match with the options
                    // if a new list of options comes, then the selection must reset
                    tap(([value, options]) => {
                        const matchingValue = this.findMatchingValue(value, options);
                        if (!this.optionsLoadingSource.value) {
                            // only change the value if the options are loaded
                            this.control.setValue(matchingValue);
                        }
                    }),
                    map(([, options]) => options)
                ),
            ]).pipe(
                debounceTime(0),
                map(([searchTerm, options]) => (searchTerm && searchTerm !== '*' ? this.filterOptions(searchTerm, options) : options))
            );
        } else {
            this.selectAllOption = this.field.settings?.selectAllOption;
            this.selectableOptions$ = combineLatest([this.control.valueChanges.pipe(startWith(this.control.value)), loadedOptions.pipe(map((options) => options || []))]).pipe(
                tap(([value, options]: [any, any]) => {
                    const toPush = [];
                    value?.forEach((val, index) => {
                        if (!this.selectAllOption || val !== this.selectAllOption.value) {
                            const match = this.findMatchingValue(val, options);
                            if (match) {
                                value[index] = match;
                            } else {
                                toPush.push(val);
                            }
                        }
                    });
                    options.push(...toPush);
                }),
                pluck(1)
            );
        }
    }

    private filterOptions(searchTerm: string, options: Array<ContezzaDisplayableValue<BaseValueType>>): Array<ContezzaDisplayableValue<BaseValueType>> {
        if (options) {
            if (!searchTerm) {
                return options;
            }
            return options.filter((option) => this.control.value?.includes(option) || option.contezzaDisplay.option.label.toLowerCase().includes(searchTerm?.trim().toLowerCase()));
        }
        return [];
    }

    beginEditing() {
        this.select.open();
        setTimeout(() => {
            // let the view update, so that the real input is available
            this.input?.focus();
        }, 0);
    }

    onSelectionChange({ value }: MatSelectChange) {
        if (this.selectAllOption) {
            const index = value.indexOf(this.selectAllOption.value);
            if (index >= 0) {
                value.splice(index, 1);
                this.control.setValue(value);
            }
        }
    }

    onOpenedChange(open: boolean) {
        if (!open) {
            this.subcontrol.setValue('');
        }
    }
}
