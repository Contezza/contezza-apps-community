import { Injectable, Type } from '@angular/core';
import { Validators } from '@angular/forms';

import { Observable, of } from 'rxjs';

import { ContezzaAsyncDialogService } from '@contezza/core/services';
import { ContezzaIdResolverService } from '@contezza/core/extensions';
import { ContezzaValidators } from '@contezza/core/utils';

import moment from 'moment';

import { ContezzaBaseFieldComponentInterface, ContezzaBaseOptionComponentInterface } from '../components';

@Injectable({
    providedIn: 'root',
})
export class ContezzaDynamicFormExtensionService {
    private readonly fieldComponents: Record<string, Type<ContezzaBaseFieldComponentInterface>> = {};
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

    setFieldComponents(values: Record<string, Type<ContezzaBaseFieldComponentInterface>>) {
        if (values) {
            Object.assign(this.fieldComponents, values);
        }
    }

    getFieldComponentById<T extends ContezzaBaseFieldComponentInterface>(id: string): Type<T> {
        return this.fieldComponents[id] as Type<T>;
    }

    hasFieldComponentById(id: string): boolean {
        return !!this.getFieldComponentById(id);
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
