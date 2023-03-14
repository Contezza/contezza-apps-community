import { AfterViewInit, ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';

import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatInput } from '@angular/material/input';

import { BehaviorSubject, combineLatest, Observable, of, timer } from 'rxjs';
import { debounce, debounceTime, distinctUntilChanged, map, pairwise, startWith, tap } from 'rxjs/operators';

import { ContezzaDisplayableValue, ContezzaDynamicForm } from '@contezza/dynamic-forms/shared';

import { ContezzaBaseFieldComponent } from '../base-field.component';

@Component({
    selector: 'contezza-autocomplete-field',
    templateUrl: './autocomplete-field.component.html',
    styleUrls: ['./autocomplete-field.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class AutocompleteFieldComponent<ValueType> extends ContezzaBaseFieldComponent<ValueType> implements OnInit, AfterViewInit {
    selectableOptions$: Observable<ContezzaDisplayableValue<ValueType>[]>;

    private readonly optionsLoadingSource = new BehaviorSubject<boolean>(false);
    readonly optionsLoading$: Observable<boolean> = this.optionsLoadingSource.asObservable();

    @ViewChild(MatInput)
    input: MatInput;

    @ViewChild(MatAutocompleteTrigger)
    trigger: MatAutocompleteTrigger;

    @Output()
    enter = new EventEmitter<string>();

    editing = false;

    isHotDynamicCell = false;

    ngAfterViewInit() {
        // TODO: rework with an injection token
        this.initializeIsHotDynamicCell();
    }

    ngOnInit() {
        super.ngOnInit();
        this.initializeOptions();
    }

    protected initializeOptions() {
        const loadedOptions: Observable<ContezzaDisplayableValue<ValueType>[]> = this.field.options.filterLoadingValues(this.optionsLoadingSource);

        if (!this.field.settings?.autocompletingMode || this.field.settings.autocompletingMode === 'client') {
            // TODO: every time the following flow changes, check impact in:
            // version selection in 'register object'
            // iot direction selection in postintake
            this.selectableOptions$ = combineLatest([
                // startWith to trigger the flow, otherwise no option is shown
                this.control.valueChanges.pipe(
                    startWith(this.control.value),
                    // apply debounceTime only on typing
                    debounce((value) => (value && typeof value === 'string' && !this.isHotDynamicCell ? timer(this.TYPING_DEBOUNCE_TIME) : of({}))),
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
                ])
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
                map(([searchTerm, options]) => (typeof searchTerm === 'string' && searchTerm !== '' && searchTerm !== '*' ? this.filterOptions(searchTerm, options) : options))
            );
        } else {
            this.selectableOptions$ = loadedOptions;
        }
    }

    displayFn(suggestion: string | ContezzaDisplayableValue<ValueType>): string {
        return typeof suggestion === 'string' ? (suggestion as string) : suggestion?.contezzaDisplay?.value?.label || '';
    }

    private filterOptions(searchTerm: string, options: Array<ContezzaDisplayableValue<ValueType>>): Array<ContezzaDisplayableValue<ValueType>> {
        if (options) {
            if (!searchTerm) {
                return options;
            }
            return options.filter((option) => option.contezzaDisplay.option.label.toLowerCase().includes(searchTerm?.trim().toLowerCase()));
        }
        return [];
    }

    onEnter(): void {
        this.enter.emit(this.control.value);
    }

    beginEditing() {
        this.editing = true;
        setTimeout(() => {
            // let the view update, so that the real input is available
            this.input.focus();
        }, 0);
    }

    endEditing(): void {
        this.editing = false;
        if (this.control.invalid) {
            this.control.setValue(null);
        }
    }

    onAutocompleteOpened(trigger, auto: MatAutocomplete) {
        // allows to select options on 'Tab'
        auto._keyManager.onKeydown = (event: KeyboardEvent) => {
            switch (event.code) {
                case 'Tab':
                    if (auto.isOpen) {
                        const activeOption = auto.options.find((option) => option.active);
                        if (activeOption) {
                            this.control.setValue(activeOption.value);
                        }
                        this.trigger.closePanel();
                    } else {
                        auto._keyManager.tabOut.next();
                    }
                    break;
                case 'ArrowDown':
                    auto._keyManager.setNextItemActive();
                    break;

                case 'ArrowUp':
                    auto._keyManager.setPreviousItemActive();
                    break;
            }
        };

        // autocomplete panel must inherit the font-size of the trigger
        const size = getComputedStyle(trigger, null).getPropertyValue('font-size');
        const panel = document.getElementById(auto.id);
        if (panel) {
            panel.style['font-size'] = size;
        }

        // apply special styling for hot-autocomplete
        if (this.isHotDynamicCell) {
            panel.parentElement.classList.add('contezza-hot-autocomplete-overlay');
        }
    }

    private initializeIsHotDynamicCell() {
        let hotParent: HTMLElement = (this.input as any)._elementRef.nativeElement;
        while (hotParent && !this.isHotDynamicCell) {
            hotParent = hotParent.parentElement;
            if (hotParent?.tagName.toLowerCase() === 'contezza-hot-dynamic-cell') {
                this.isHotDynamicCell = true;
            }
        }
    }

    onBlur(event: FocusEvent) {
        if (!(event.relatedTarget?.['tagName'] === 'MAT-OPTION')) {
            this.trigger.closePanel();
        }
    }
}
