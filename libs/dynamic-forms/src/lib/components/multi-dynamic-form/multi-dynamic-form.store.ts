import { Directive, Injectable, OnDestroy } from '@angular/core';

import { AbstractControl, FormGroup } from '@angular/forms';

import { ComponentStore } from '@ngrx/component-store';

import { combineLatestWith, forkJoin, Observable, of } from 'rxjs';
import { debounceTime, map, startWith, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { ContezzaObjectUtils } from '@contezza/core/utils';
import { ContezzaDynamicForm, ContezzaDynamicFormField, DynamicFormItem } from '@contezza/dynamic-forms/shared';

import { ContezzaDynamicFormService } from '../../services';

interface DynamicFormsState<ItemType> {
    readonly forms: Map<string, ContezzaDynamicForm>;
    readonly form: FormGroup;
    readonly activeItem?: ItemType;
}

@Directive()
@Injectable()
export class MultiDynamicFormStore<ItemType extends DynamicFormItem = DynamicFormItem> extends ComponentStore<DynamicFormsState<ItemType>> implements OnDestroy {
    // selectors
    readonly forms$: Observable<DynamicFormsState<ItemType>['forms']> = this.select(({ forms }) => forms);
    readonly formByItem$ = (item: ItemType): Observable<ContezzaDynamicForm> => this.select(this.forms$, (forms) => (item ? forms.get(item.id) : undefined));
    readonly dynamicForms$: Observable<ContezzaDynamicForm[]> = this.select(this.forms$, (forms) => Array.from(forms.values()));

    readonly form$: Observable<FormGroup> = this.select(({ form }) => form);
    readonly valid$: Observable<boolean> = this.select(this.form$, (form) =>
        form.statusChanges.pipe(
            startWith(form.status), // Emit the initial status
            debounceTime(0),
            map((status) => status === 'VALID')
        )
    ).pipe(switchMap((valid) => valid));

    readonly value$: Observable<any> = this.select(this.form$, (form) => form.valueChanges.pipe(debounceTime(0)))
        .pipe(switchMap((value) => value))
        .pipe(
            combineLatestWith(this.dynamicForms$),
            switchMap(([values, form]) => this.getFormatted(form, values))
        );

    readonly activeItem$: Observable<ItemType | undefined> = this.select(({ activeItem }) => activeItem);
    readonly activeForm$: Observable<ContezzaDynamicForm> = this.activeItem$.pipe(switchMap((activeItem) => this.formByItem$(activeItem)));
    readonly activeFormValid$: Observable<boolean> = this.activeForm$.pipe(switchMap((form) => form?.valid.pipe(startWith(form.form.valid)) || of(false)));

    // reducers
    readonly initialize = this.updater((state, items: ItemType[]) => {
        const newForms = new Map<string, ContezzaDynamicForm>();
        items.forEach((item) => {
            if (!state.forms.has(item.id)) {
                const form: ContezzaDynamicForm = this.dynamicFormService.get(item.formId, item.layoutId || 'default', true);
                if (item.dependencies) {
                    form.provideDependencies(item.dependencies);
                }
                form.build();
                newForms.set(item.id, form);
                state.form.addControl(item.id, form.form);
            } else {
                newForms.set(item.id, state.forms.get(item.id));
            }
        });
        return { ...state, forms: newForms };
    });
    readonly enable = this.updater((state, items: { id: string }[]) => {
        Object.keys(state.form.controls).forEach((control) => state.form.removeControl(control));
        items.forEach(({ id }) => state.form.addControl(id, state.forms.get(id).form));
        return { ...state };
    });
    readonly destroy = this.updater((state) => {
        state.forms.forEach((form) => form.destroy(true));
        return { ...state };
    });

    // effects
    /**
     * Copies the given-item form value to all other enabled forms, regardless of their current status or value.
     */
    readonly copyToAll = this.effect((item$: Observable<ItemType>) =>
        item$.pipe(
            withLatestFrom(this.form$),
            tap(([item, group]) => {
                const source = group.get(item.id).value;
                Object.entries(group.controls)
                    .filter(([key]) => key !== item.id)
                    .map(([, form]) => form)
                    .forEach((form: FormGroup) => {
                        const value = {};
                        Object.keys(form.controls).forEach((key) => (value[key] = source[key]));
                        form.patchValue(value);
                    });
            })
        )
    );
    /**
     * Copies the given-item form value to the nullish controls of all other enabled forms.
     */
    readonly ifnCopyToAll = this.effect((item$: Observable<ItemType>) =>
        item$.pipe(
            withLatestFrom(this.form$),
            tap(([item, group]) => {
                const source = group.get(item.id);
                Object.entries(group.controls)
                    .filter(([key]) => key !== item.id)
                    .map(([, form]) => form)
                    .forEach((form: FormGroup) => {
                        const value = {};
                        const recursion = (control: AbstractControl, key?: string) => {
                            if ('controls' in control) {
                                const group = control as FormGroup;
                                Object.entries(group.controls).forEach(([k, c]) => {
                                    recursion(c, [key, k].filter((v) => !!v).join('.'));
                                });
                            } else {
                                const currentValue = ContezzaObjectUtils.getValue(form.value, key);
                                if (!currentValue) {
                                    ContezzaObjectUtils.setValue(value, key, control.value);
                                }
                            }
                        };
                        recursion(source);
                        form.patchValue(value);
                    });
            })
        )
    );
    /**
     * Copies the given-item form value to the form of the active item, regardless of its current status or value.
     */
    readonly copyToActive = this.effect((item$: Observable<ItemType>) =>
        item$.pipe(
            withLatestFrom(this.activeItem$),
            tap(([item, activeItem]) => this.copyToTarget({ sourceId: item.id, targetId: activeItem.id }))
        )
    );
    /**
     * Copies the source form value to the target form, regardless of its current status or value.
     */
    readonly copyToTarget = this.effect((ids$: Observable<{ sourceId: string; targetId: string }>) =>
        ids$.pipe(
            withLatestFrom(this.form$),
            tap(([{ sourceId, targetId }, group]) => {
                const source = group.get(sourceId).value;
                const target: FormGroup = group.get(targetId);
                const value = {};
                Object.keys(target.controls).forEach((key) => (value[key] = source[key]));
                target.patchValue(value);
            })
        )
    );

    constructor(private readonly dynamicFormService: ContezzaDynamicFormService) {
        super({ forms: new Map<string, ContezzaDynamicForm>(), form: new FormGroup({}) });
    }

    ngOnDestroy() {
        this.destroy();
    }

    private getFormatted(forms: ContezzaDynamicForm[], formValues: Record<string, Record<string, any>>): Observable<Record<string, Record<string, any>>> {
        const formatterKey = 'value';

        const keysArray = Object.keys(formValues);

        return of(formValues).pipe(
            switchMap((formValues) => {
                // Iterate over the main keys
                const formattedEntries$ = Object.keys(formValues).map((key) => {
                    const subRecord = formValues[key];
                    const index = keysArray.indexOf(key);

                    // Iterate over the sub-keys
                    const formattedSubRecord$ = forkJoin(
                        Object.keys(subRecord).map((subKey) => {
                            const fieldRootField = forms[index].rootField.subfields.find((field) => field.id === subKey) as ContezzaDynamicFormField;

                            const formatter = fieldRootField.format?.[formatterKey];

                            if (formatter) {
                                const newValue$ = formatter(subRecord[subKey]) as Observable<any>;

                                // Apply formatting and return the result as a tuple of [subKey, formattedValue]
                                return newValue$.pipe(map((newValue) => [subKey, newValue]));
                            } else {
                                // Return the original value as a tuple of [subKey, originalValue]
                                return of([subKey, subRecord[subKey]]);
                            }
                        })
                    ).pipe(
                        // Convert the array of tuples back into a Record<string, any>
                        map((formattedEntries) => {
                            return formattedEntries.reduce((subAcc, [subKey, formattedValue]) => {
                                subAcc[subKey as string] = formattedValue;
                                return subAcc;
                            }, {} as Record<string, any>);
                        })
                    );

                    // Return the formatted sub-record along with its key as a tuple of [key, formattedSubRecord]
                    return formattedSubRecord$.pipe(map((formattedSubRecord) => [key, formattedSubRecord]));
                });

                // Combine all the formatted sub-records into the final structure
                return forkJoin(formattedEntries$).pipe(
                    map((formattedPairs) => {
                        return formattedPairs.reduce((acc, [key, formattedSubRecord]) => {
                            acc[key as string] = formattedSubRecord as Record<string, any>;
                            return acc;
                        }, {} as Record<string, Record<string, any>>);
                    })
                );
            })
        );
    }
}
