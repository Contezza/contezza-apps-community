import { Injectable, Type } from '@angular/core';
import { AbstractControl, ValidationErrors, Validators } from '@angular/forms';

import { from, Observable, of } from 'rxjs';

import { ContezzaAsyncDialogService } from '@contezza/core/services';
import { ContezzaIdResolverService } from '@contezza/core/extensions';
import { ContezzaUtils, ContezzaValidators } from '@contezza/core/utils';

import moment from 'moment';

import { ContezzaBaseFieldComponentInterface, ContezzaBaseOptionComponentInterface } from '../components';

@Injectable({
    providedIn: 'root',
})
export class ContezzaDynamicFormExtensionService {
    private readonly fieldComponents: Record<string, Type<ContezzaBaseFieldComponentInterface> | (() => Promise<Type<ContezzaBaseFieldComponentInterface>>)> = {};
    private readonly optionComponents: Record<string, Type<ContezzaBaseOptionComponentInterface>> = {};
    private readonly dialogServices: Record<string, ContezzaAsyncDialogService<any, any, any>> = {};

    constructor(private readonly idResolver: ContezzaIdResolverService) {
        this.loadDefault();
    }

    loadDefault() {
        const angularValidators = {};
        ['min', 'max', 'required', 'requiredTrue', 'email', 'minLength', 'maxLength', 'pattern', 'nullValidator', 'compose', 'composeAsync'].forEach(
            (key) => (angularValidators[key] = Validators[key])
        );
        this.setValidators(angularValidators);
        this.setValidators({ ...ContezzaValidators });
        this.setValidators({
            /**
             * Resolves a validator based on the given id. The function given as parameter is applied to the `control` which is being validated and the returned value is given as parameter to the resolved validator.
             *
             * @param id An id which resolves to a validator.
             * @param parameters A string which resolves to a JS function. This function is applied to the `control` which is being validated and the returned value is given as parameter to the resolved validator.
             */
            dynamic: ({ id, parameters }: { id: string; parameters: string }) => {
                const validator = this.idResolver.resolve(id, 'validator');
                if (!validator) {
                    throw new Error(`Cannot find validator with id ${id}`);
                }
                return (control: AbstractControl): ValidationErrors | null => (parameters ? validator(ContezzaUtils.stringToFunction(parameters)(control)) : validator)(control);
            },
        });

        this.setSourceTypes({
            custom: (source) => {
                switch (source) {
                    case 'date.now':
                        return of(moment(new Date()));
                    default:
                        return of(undefined);
                }
            },
        });
    }

    setFieldComponents(values: ContezzaDynamicFormExtensionService['fieldComponents']) {
        if (values) {
            Object.assign(this.fieldComponents, values);
        }
    }

    getFieldComponentById(id: string): Observable<Type<ContezzaBaseFieldComponentInterface>> {
        const component$: () => Promise<Type<ContezzaBaseFieldComponentInterface>> = this.fieldComponents[id] as any;

        if (!component$) {
            throw new Error('Unknown dynamic-form field component: ' + id);
        }

        try {
            return from(component$());
        } catch (e) {
            // console.warn('Non-lazy dynamic-form loading is deprecated, please fix it for field component: ' + id);
            return of(component$ as any);
        }
    }

    hasFieldComponentById(id: string): boolean {
        return !!this.fieldComponents[id];
    }

    setOptionComponents(values: Record<string, Type<ContezzaBaseOptionComponentInterface>>) {
        if (values) {
            Object.assign(this.optionComponents, values);
        }
    }

    getOptionComponentById<T extends ContezzaBaseOptionComponentInterface>(id: string): Type<T> {
        return this.optionComponents[id] as Type<T>;
    }

    hasOptionComponentById(id: string): boolean {
        return !!this.getOptionComponentById(id);
    }

    setDialogServices(values: Record<string, ContezzaAsyncDialogService<any, any, any>>) {
        if (values) {
            Object.assign(this.dialogServices, values);
        }
    }

    getDialogServiceById<T extends ContezzaAsyncDialogService<any, any, any>>(id: string): T {
        return this.dialogServices[id] as T;
    }

    hasDialogServiceById(id: string): boolean {
        return !!this.getDialogServiceById(id);
    }

    setOperators(values: Record<string, any>) {
        if (values) {
            this.idResolver.set(values, 'operator');
        }
    }

    setValidators(values: Record<string, any>) {
        if (values) {
            this.idResolver.set(values, 'validator');
        }
    }

    setMaps(values: Record<string, any>) {
        if (values) {
            this.idResolver.set(values, 'map');
        }
    }

    setSourceTypes(values: Record<string, (value: string, options?: any) => Observable<any>>) {
        if (values) {
            this.idResolver.set(values, 'sourceType');
        }
    }
}
