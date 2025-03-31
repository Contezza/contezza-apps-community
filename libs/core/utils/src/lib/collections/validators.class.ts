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
        const isNullish = (value) => value === '' || value === undefined || value === null;
        return (control: AbstractControl): ValidationErrors | null =>
            Object.keys(control.value).every((key) => (isNullish(control.value[key]) && isNullish(originalValue[key])) || control.value[key] === originalValue[key])
                ? { isFormValueChanged: { value: control.value } }
                : null;
    };

    static hasProperties =
        (properties: string[]): ValidatorFn =>
        (control: AbstractControl): ValidationErrors | null =>
            control.value && (typeof control.value !== 'object' || !properties.every((prop) => Object.keys(control.value).includes(prop)))
                ? { hasProperties: { value: control.value } }
                : null;

    static isString = (control: AbstractControl): ValidationErrors | null => (typeof control.value !== 'string' ? { isString: { value: control.value } } : null);

    static blacklist = (blacklist: string[]): ValidatorFn => Validators.pattern('^(?![\\s]*(' + blacklist.join('|') + ')[\\s]*$).*$');

    static requiredDateRange = (control: AbstractControl<DateRange>): ValidationErrors | null =>
        control.value?.from && control.value?.to && moment.isMoment(control.value.from) && moment.isMoment(control.value.to)
            ? null
            : { requiredDateRange: { value: control.value } };

    static isDirty = (control: AbstractControl): ValidationErrors | null => (control.pristine ? { isDirty: { value: control.value } } : null);

    /**
     * Requires that at least one of the form controls is filled in.
     *
     * @param form
     */
    static requiredAtLeastOneField = (form: FormGroup) => {
        const isFilled = (x: any): boolean => {
            if (x) {
                if (typeof x === 'object' && 'from' in x && 'to' in x) {
                    return !!x.from || !!x.to;
                } else if (Array.isArray(x)) {
                    return x.length > 0;
                } else {
                    return true;
                }
            } else {
                return false;
            }
        };
        return Object.values(form.controls || {})
            .map((_) => _.value)
            .some(isFilled)
            ? null
            : { requiredAtLeastOneField: '' };
    };
}
