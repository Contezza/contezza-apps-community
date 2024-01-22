import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';

import { BehaviorSubject, combineLatest, defer, merge, Observable, of, startWith, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, switchMap, take, takeUntil } from 'rxjs/operators';

import { ContezzaDependency } from '@contezza/core/extensions';
import { ContezzaObjectUtils } from '@contezza/core/utils';

import { ContezzaDynamicFormField, ContezzaDynamicFormLayout, ContezzaDynamicFormValidation, ContezzaFormField } from '../models';

export class ContezzaDynamicForm {
    form?: FormGroup;
    /**
     * @deprecated use `valid$` instead
     */
    valid?: Observable<boolean>;

    private readonly validSource = new BehaviorSubject<boolean>(false);
    readonly valid$ = this.validSource.asObservable();

    private readonly formatted$: Record<string, Observable<any>> = {};

    /**
     * Returns an observable which emits the form value formatted using the formatter having the given key.
     *
     * @param key
     */
    format(key: string = 'value'): Observable<any> {
        return (this.formatted$[key] ??= this.getFormatted(key));
    }

    /**
     * Returns an observable which emits the form value formatted using the default formatter.
     */
    get value$(): Observable<any> {
        return this.format('value');
    }

    protected?: boolean;

    protected _built = new BehaviorSubject(false);
    get built(): boolean {
        return this._built.value;
    }

    private readonly providedDependencies: Record<string, Observable<any>> = {};

    // TODO: check and improve
    static makeDefaultLayout(rootField: ContezzaDynamicFormField): ContezzaDynamicFormLayout {
        return { id: 'standard', type: 'subform', subfields: rootField.subfields.filter((field) => !!field.type).map((field) => ({ id: field.id, type: 'field' })) };
    }

    static getFieldById<T extends { id: string; subfields?: T[] }>(rootField: T, id: string): T {
        let target: T = rootField;
        const splitId = id.split('.');
        splitId.forEach((groupName) => (target = target.subfields?.find((subfield) => subfield.id === groupName)));
        return target;
    }

    static getValueSource<BaseValueType, ValueType extends BaseValueType | BaseValueType[]>(field: ContezzaDynamicFormField<BaseValueType, ValueType>): Observable<ValueType> {
        return field.initialValue && field.defaultValue
            ? merge(
                  field.initialValue.pipe(
                      filter((value) => value !== undefined),
                      map((value) => ({ value, type: 'initial', time: new Date().getTime() }))
                  ),
                  field.defaultValue.pipe(map((value) => ({ value, type: 'default', time: new Date().getTime() })))
              ).pipe(
                  distinctUntilChanged((oldValue, newValue) => {
                      // if initialValue emits, then defaultValue is temporarily ignored
                      if (oldValue.type === 'initial' && newValue.type === 'default') {
                          return newValue.time - oldValue.time < 1000;
                      }
                      return false;
                  }),
                  map((value) => value.value)
              )
            : field.initialValue || field.defaultValue;
    }

    static initializeValue(field: ContezzaDynamicFormField) {
        field.defaultValue?.repeat();
        field.initialValue?.repeat();
    }

    static makeFormFromFields(dynamicForm: ContezzaDynamicForm, field: ContezzaDynamicFormField = dynamicForm.rootField): AbstractControl {
        let control: AbstractControl;
        if (field.type === 'subform' && field.subfields) {
            const form = new FormGroup(
                {},
                {
                    validators: ContezzaDynamicForm.composeValidations(field.validations || []),
                }
            );
            field.subfields.forEach((subfield) => {
                const subcontrol: AbstractControl = ContezzaDynamicForm.makeFormFromFields(dynamicForm, subfield);
                form.addControl(subfield.id, subcontrol);
            });
            control = form;
        } else {
            control = new FormControl({ value: undefined, disabled: true }, ContezzaDynamicForm.composeValidations(field.validations || []));
        }
        return control;
    }

    static composeValidations(validations?: ContezzaDynamicFormValidation[]): ValidatorFn {
        if (validations?.length) {
            const validList = [];
            validations
                .filter((valid) => !!valid.validator)
                .forEach((valid) => {
                    validList.push(valid.validator);
                });
            return Validators.compose(validList);
        }
        return null;
    }

    constructor(
        readonly rootField: ContezzaDynamicFormField,
        readonly layout?: ContezzaDynamicFormLayout,
        readonly dependencies?: ContezzaDependency[],
        protected readonly destroy$: Subject<void> = new Subject<void>()
    ) {
        if (!layout) {
            this.layout = ContezzaDynamicForm.makeDefaultLayout(rootField);
        }
    }

    build(form?: FormGroup): ContezzaDynamicForm {
        if (!this.built && !this.form) {
            if (!form) {
                form = ContezzaDynamicForm.makeFormFromFields(this) as FormGroup;
            }
            this.form = form;
            this.valid = form.statusChanges.pipe(
                debounceTime(250),
                map((status) => status === 'VALID'),
                takeUntil(this.destroy$)
            );
            form.statusChanges
                .pipe(
                    debounceTime(100),
                    map((status) => status === 'VALID'),
                    takeUntil(this.destroy$)
                )
                .subscribe((valid) => this.validSource.next(valid));
            this.bindValues();
            this.bindDependencies();
            this.buildExtras();

            (this.form.get('initialValue')?.valueChanges.pipe(debounceTime(0), take(1)) || of(undefined)).subscribe(() => this._built.next(true));
        }
        return this;
    }

    destroy(force: boolean = false) {
        if (this.canBeDestroyed(force)) {
            this.destroy$.next();
            this.form = undefined;
            this.dependencies?.forEach((dependency) => dependency.destroy());
            this.destroyExtras();
            this._built.next(false);
        }
    }

    canBeDestroyed(force: boolean = false): boolean {
        return force || !this.protected;
    }

    protect(): ContezzaDynamicForm {
        this.protected = true;
        const protect = (field: ContezzaFormField) => {
            ContezzaObjectUtils.setValue(field, 'settings.protected', true);
            field.subfields?.forEach((subfield) => protect(subfield));
        };
        protect(this.rootField);
        return this;
    }

    enable(
        ids: string[] = ContezzaObjectUtils.findKeys(this.layout, (item) => !item.subfields && !Array.isArray(item))
            .map((key) => ContezzaObjectUtils.getValue(this.layout, key).id)
            .filter((value) => !!value)
    ) {
        ids.forEach((id) => this.form.get(id)?.enable());
    }

    get valueChanges(): Observable<any> {
        return this._built.pipe(
            filter((value) => !!value),
            switchMap(() => this.form.valueChanges),
            debounceTime(0),
            takeUntil(this.destroy$)
        );
        // const keys = ContezzaObjectUtils.findKeys(
        //     this.form,
        //     (control) => !!control && control instanceof FormControl,
        //     (subtarget) => Object.entries(subtarget.controls)
        // ).filter((key) => key !== 'initialValue');
        //
        // const controlValueChanges = keys.map((key) => {
        //     const control = this.form.get(key);
        //     return control.valueChanges.pipe(
        //         filter(() => control.valid),
        //         startWith(control.value),
        //         map((value) => {
        //             const output = {};
        //             output[key] = value;
        //             return output;
        //         })
        //     );
        // });
        //
        // return combineLatest(controlValueChanges).pipe(
        //     takeUntil(this.destroy$),
        //     debounceTime(0),
        //     map((values) =>
        //         values
        //             .filter((value) => !!value && !!Object.values(value)[0])
        //             .reduce((acc, value) => {
        //                 Object.entries(value).forEach(([key, val]) => {
        //                     ContezzaObjectUtils.setValue(acc, key, val);
        //                 });
        //                 return acc;
        //             }, {})
        //     )
        // );
    }

    markInvalidFields() {
        if (this.form) {
            this.form.markAllAsTouched();
            const updateValueAndValidity = (control) => {
                control.updateValueAndValidity();
                if (control.controls) {
                    Object.values(control.controls).forEach((subcontrol) => updateValueAndValidity(subcontrol));
                }
            };
            updateValueAndValidity(this.form);
        }
    }

    reset(state: 'default' | 'initial') {
        const reset = (field: ContezzaDynamicFormField) => {
            field[state + 'Value']?.repeat();
            field.subfields?.forEach((subfield) => reset(subfield));
        };
        reset(this.rootField);
    }

    getFieldById(id: string): ContezzaDynamicFormField {
        return ContezzaDynamicForm.getFieldById(this.rootField, id);
    }

    getControlById(id: string): AbstractControl {
        return this.form.get(id);
    }

    getFieldLayoutById(id: string): ContezzaDynamicFormLayout {
        return ContezzaDynamicForm.getFieldById(this.layout, id);
    }

    provideDependencies(dependencies: Record<string, Observable<any>>): ContezzaDynamicForm {
        if (dependencies) {
            Object.assign(this.providedDependencies, dependencies);
        }
        return this;
    }

    private bindValues() {
        const bind = (field: ContezzaDynamicFormField, form: AbstractControl = this.form) => {
            const matchingControl = form.get(field.id);
            if (matchingControl) {
                ContezzaDynamicForm.getValueSource(field)
                    ?.pipe(takeUntil(this.destroy$))
                    .subscribe((value) => matchingControl.reset(value ?? undefined));
            }
            field.subfields?.forEach((subfield) => bind(subfield, matchingControl || form));
        };
        bind(this.rootField);
    }

    private bindDependencies() {
        this.dependencies?.forEach((dependency) => {
            type DependencySuffix = 'status' | 'raw' | 'custom';
            const [fieldName, suffix]: [string, DependencySuffix] = dependency.key.split('$', 2) as [string, DependencySuffix];
            const control = this.form.get(fieldName);
            if (control) {
                let observable: Observable<any>;
                switch (suffix) {
                    case 'status':
                        observable = control.statusChanges;
                        break;
                    case 'raw':
                        observable = control.valueChanges;
                        break;
                    case 'custom':
                        const subject = new Subject();
                        observable = subject;
                        this.getFieldById(fieldName).customObservable = subject;
                        break;
                    default:
                        observable = control.valueChanges.pipe(filter(() => control.valid));
                }
                // distinctUntilChanged() otherwise updateValueAndValidity() triggers call repetitions
                observable.pipe(distinctUntilChanged(), takeUntil(this.destroy$)).subscribe((value) => dependency.next(value));
                // pushing the updates to the dependencies
                control.updateValueAndValidity();
            } else {
                this.providedDependencies[fieldName]?.pipe(distinctUntilChanged(), takeUntil(this.destroy$)).subscribe((value) => dependency.next(value));
            }
        });
    }

    private getFormatted(key: string = 'value'): Observable<any> {
        const recursion = ({ field, form }: { field: ContezzaDynamicFormField; form: AbstractControl }): Observable<{ id: string; value: any }> => {
            const matchingControl = field.id && form.get(field.id);
            const formatter = field.format?.[key];
            return defer(() =>
                matchingControl && !('controls' in matchingControl)
                    ? // base case: form control -> value
                      combineLatest([
                          matchingControl.valueChanges.pipe(startWith(matchingControl.value)),
                          matchingControl.statusChanges.pipe(startWith(matchingControl.status)),
                      ]).pipe(
                          debounceTime(0),
                          // if the control is not valid then return undefined
                          // N.B. this is important in particular with DISABLED controls
                          // apply value extractor if defined
                          switchMap(([value, status]) => (status === 'VALID' ? (formatter ? formatter(value) : of(value)) : of(undefined)))
                      )
                    : // induction step: collect values from subfields
                      combineLatest((field.subfields || []).map((subfield) => recursion({ field: subfield, form: matchingControl || form }))).pipe(
                          // let values wait for each other
                          debounceTime(0),
                          // convert {id, value}[] into {id: value}
                          map((values) => ContezzaObjectUtils.fromEntries<any>(values.map(({ id, value }) => [id, value]))),
                          // apply value extractor if defined
                          switchMap((value) => (formatter && (matchingControl ? matchingControl.valid : this.form.valid) ? formatter(value) : of(value)))
                      )
            ).pipe(
                // wrap value to make field id available
                map((value) => ({ id: field.id, value }))
            );
        };
        return recursion({ field: this.rootField, form: this.form }).pipe(map((_) => (this.form.valid ? _.value : null)));
    }

    protected buildExtras() {}

    protected destroyExtras() {}
}
