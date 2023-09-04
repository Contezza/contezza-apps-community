import { Injectable } from '@angular/core';
import { ValidatorFn } from '@angular/forms';

import { ContezzaIdResolverService, ContezzaIdResolverSource } from '@contezza/core/extensions';

import { createMask } from '@ngneat/input-mask';

import { ContezzaDynamicFormValidation, ValidationSource } from '../models';

@Injectable({
    providedIn: 'root',
})
export class ContezzaDynamicFormValidationService {
    private readonly DEFAULT_MESSAGES = {
        required: 'APP.VALIDATIONS.REQUIRED',
        hasProperties: 'APP.VALIDATIONS.INVALID_SELECTION',
        email: 'APP.VALIDATIONS.EMAIL',
        maxLength: 'APP.VALIDATIONS.MAX_LENGTH',
    };

    constructor(private readonly idResolver: ContezzaIdResolverService) {}

    resolve(source: ContezzaIdResolverSource<ValidationSource>): ContezzaDynamicFormValidation {
        const validation: ValidationSource = typeof source === 'string' ? { id: source, message: this.DEFAULT_MESSAGES[source] } : source;
        const id = validation.id;
        const message = validation.message ?? this.DEFAULT_MESSAGES[id];
        let mask;
        let validator: ValidatorFn;
        switch (id) {
            case 'inputMask':
                if (validation.parameters) {
                    mask =
                        typeof validation.parameters === 'string'
                            ? createMask({
                                  mask: validation.parameters,
                                  placeholder: '',
                              })
                            : createMask({ ...validation.parameters, placeholder: '' });
                }
                break;
            default:
                validator = this.idResolver.resolve(validation, 'validator');
        }
        return {
            id,
            message,
            mask,
            validator,
        };
    }
}
