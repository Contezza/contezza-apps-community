import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
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

    static hasProperties = (properties: string[]): ValidatorFn => {
        return (control: AbstractControl): ValidationErrors | null =>
            control.value && (typeof control.value !== 'object' || !properties.every((prop) => Object.keys(control.value).includes(prop)))
                ? { hasProperties: { value: control.value } }
                : null;
    };

    static isString = (control: AbstractControl): ValidationErrors | null => {
        return typeof control.value !== 'string' ? { isString: { value: control.value } } : null;
    };

    static blacklist = (blacklist: string[]): ValidatorFn => {
        return Validators.pattern('^(?![\\s]*(' + blacklist.join('|') + ')[\\s]*$).*$');
    };

    static requiredDateRange = (control: AbstractControl<DateRange>): ValidationErrors | null => {
        return control.value?.from && control.value?.to && moment.isMoment(control.value.from) && moment.isMoment(control.value.to)
            ? null
            : { requiredDateRange: { value: control.value } };
    };
}
