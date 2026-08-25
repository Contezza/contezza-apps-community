import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

import moment from 'moment';

import { DateRange } from '../interfaces';

export class ContezzaValidators {
    static isObject = (): ValidatorFn => {
        // use variable because of error on `core` build 'Lambda not supported' (https://stackoverflow.com/questions/57594723/angular-metadata-collected-contains-an-error-that-will-be-reported-at-runtime)
        // noinspection UnnecessaryLocalVariableJS
        const valid = (control: AbstractControl): ValidationErrors | null => (typeof control.value !== 'object' ? { isObject: { value: control.value } } : null);
        return valid;
    };

    static isFormValueChanged = (originalValue): ValidatorFn => {
        const isNullish = value => value === '' || value === undefined || value === null;
        return (control: AbstractControl): ValidationErrors | null =>
            Object.keys(control.value).every(key => (isNullish(control.value[key]) && isNullish(originalValue[key])) || control.value[key] === originalValue[key])
                ? { isFormValueChanged: { value: control.value } }
                : null;
    };

    static hasProperties =
        (properties: string[]): ValidatorFn =>
        (control: AbstractControl): ValidationErrors | null =>
            control.value && (typeof control.value !== 'object' || !properties.every(prop => Object.keys(control.value).includes(prop)))
                ? { hasProperties: { value: control.value } }
                : null;

    static isString = (control: AbstractControl): ValidationErrors | null => (typeof control.value !== 'string' ? { isString: { value: control.value } } : null);

    static blacklist = (blacklist: string[]): ValidatorFn => Validators.pattern('^(?![\\s]*(' + blacklist.join('|') + ')[\\s]*$).*$');

    static requiredDateRange = (control: AbstractControl<DateRange>): ValidationErrors | null =>
        control.value?.from && control.value?.to && moment.isMoment(control.value.from) && moment.isMoment(control.value.to)
            ? null
            : { requiredDateRange: { value: control.value } };

    static invalidDateRange = (control: AbstractControl<DateRange>): ValidationErrors | null => {
        const value = control.value;
        const from = value?.from;
        const to = value?.to;

        if (moment.isMoment(from) && moment.isMoment(to) && from.isAfter(to)) {
            return { invalidDateRange: { from: from.toISOString(), to: to.toISOString() } };
        }

        return null;
    };

    static isDirty = (control: AbstractControl): ValidationErrors | null => (control.pristine ? { isDirty: { value: control.value } } : null);

    /**
     * Requires that at least one of the form controls is filled in.
     *
     * @param form
     */
    static requiredAtLeastOneField = (form: FormGroup) =>
        Object.values(form.controls || {})
            .map(_ => _.value)
            .some(isFilled)
            ? null
            : { requiredAtLeastOneField: '' };

    /**
     * Creates a validator that conditionally makes controls on the parent form required.
     *
     * If at least one of the controls specified in `ifSome` has a filled value,
     * `Validators.required` is added to each control specified in `require`.
     * Otherwise, the required validator is removed from those controls.
     *
     * The controls in `ifSome` are looked up on the validated `FormGroup`, while
     * the controls in `require` MUST belong to its parent form. This separation is
     * intentional: calling `updateValueAndValidity()` on controls within the same
     * group would cause the group validator to run again, resulting in an endless
     * validation loop.
     *
     * After adding or removing the validator, each affected control's validity
     * is recalculated using `updateValueAndValidity()`.
     *
     * This validator does not produce validation errors itself and always returns
     * `null`. Any resulting validation errors are reported by the target controls
     * themselves when they are required but not filled.
     *
     * @param params Configuration that determines which controls become required and when.
     * @param params.require Names of controls on the parent form that should become required. These controls must belong to the parent form rather than the validated group.
     * @param params.ifSome Names of controls in the current form group that trigger the requirement
     * when at least one of them is filled.
     *
     * @returns A validator function for an Angular `FormGroup`.
     */
    static conditionallyRequire =
        (params: { require: string[]; ifSome: string[] }) =>
        (form: FormGroup): ValidationErrors | null => {
            if (form.parent) {
                const requireControls = params.require.map(name => form.parent.controls[name]).filter(Boolean);
                const ifSomeControls = params.ifSome.map(name => form.controls[name]).filter(Boolean);
                const isRequired = ifSomeControls.map(c => c.value).some(isFilled);
                if (isRequired) {
                    requireControls.forEach(c => {
                        c.addValidators(Validators.required);
                        c.updateValueAndValidity();
                    });
                } else {
                    requireControls.forEach(c => {
                        c.removeValidators(Validators.required);
                        c.updateValueAndValidity();
                    });
                }
            }

            return null;
        };
}

function isFilled(value: any): boolean {
    if (value) {
        if (typeof value === 'object' && 'from' in value && 'to' in value) {
            return !!value.from || !!value.to;
        } else if (Array.isArray(value)) {
            return value.length > 0;
        } else {
            return true;
        }
    } else {
        return false;
    }
}
