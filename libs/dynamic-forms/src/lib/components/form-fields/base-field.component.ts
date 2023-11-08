import { Directive, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, ValidatorFn, Validators } from '@angular/forms';

import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { DestroyService } from '@contezza/core/services';
import { ContezzaBaseFieldComponentInterface, ContezzaDynamicForm, ContezzaDynamicFormField, SettingsService } from '@contezza/dynamic-forms/shared';

@Directive()
export abstract class ContezzaBaseFieldComponent<BaseValueType = any, ValueType extends BaseValueType | BaseValueType[] = BaseValueType>
    implements ContezzaBaseFieldComponentInterface<BaseValueType, ValueType>, OnInit, OnDestroy
{
    protected readonly formSettings: SettingsService = inject(SettingsService);

    @Input()
    readonly field: ContezzaDynamicFormField<BaseValueType, ValueType>;

    @Input()
    readonly control: FormControl;

    @Input()
    set readonly(value: boolean) {
        this.readonlySource.next(value);
    }

    get readonly(): boolean {
        return this.readonlySource.value;
    }
    private readonly readonlySource = new BehaviorSubject<boolean>(false);
    readonly$: Observable<boolean>;

    required: boolean;
    protected: boolean;

    inputMask;

    // implementing a workaround for an issue similar to https://github.com/ngneat/input-mask/issues/43
    validatorBackup: ValidatorFn;

    constructor(protected readonly destroy$: DestroyService) {}

    ngOnInit(): void {
        this.initializeRequired();
        this.initializeReadonly();
        this.initializeProtected();
        this.initializeMask();
        this.initializeControl();
        this.initializeValue();

        // this.control.valueChanges.pipe(takeUntil(this.destroy$), distinctUntilChanged(), debounceTime(200)).subscribe((value) => (this.field.value = value));
    }

    ngOnDestroy() {
        this.control.validator = this.validatorBackup;

        if (!this.protected) {
            this.control.setValue(undefined);
            this.control.disable();
        }
    }

    protected initializeControl() {
        if (!this.protected) {
            this.control.enable();
        }
    }

    protected initializeValue() {
        if (!this.protected && !this.control.value) {
            ContezzaDynamicForm.initializeValue(this.field);
        }
    }

    protected initializeRequired() {
        this.required = this.field.validations?.filter((val) => val.validator === Validators.required)?.length > 0;
    }

    protected initializeReadonly() {
        this.readonly$ = combineLatest([this.readonlySource, this.field.rules?.readonly || of(false)]).pipe(map((readonly) => readonly.some(Boolean)));
    }

    protected initializeProtected() {
        this.protected = this.field.settings?.protected;
    }

    protected initializeMask() {
        this.validatorBackup = this.control.validator;
        this.inputMask = this.field.validations?.find((val) => val.id === 'inputMask')?.mask;
    }

    protected findMatchingValue(value: Partial<BaseValueType> | Partial<BaseValueType>[], options: BaseValueType[]): ValueType {
        if (value && options) {
            if (Array.isArray(value)) {
                return value.map(
                    (item) =>
                        options.find((option) =>
                            Object.entries(item)
                                .filter(([key, val]) => key !== 'contezzaDisplay' && ['string', 'number', 'boolean'].includes(typeof val))
                                .every(([key, val]) => option[key] === val)
                        ) || item
                ) as ValueType;
            } else {
                return options.find((option) =>
                    Object.entries(value)
                        .filter(([key, val]) => key !== 'contezzaDisplay' && ['string', 'number', 'boolean'].includes(typeof val))
                        .every(([key, val]) => option[key] === val)
                ) as unknown as ValueType;
            }
        } else {
            return null;
        }
    }

    clear(event) {
        this.control.reset();
        this.control.markAsTouched();
        event.stopPropagation();
    }
}
