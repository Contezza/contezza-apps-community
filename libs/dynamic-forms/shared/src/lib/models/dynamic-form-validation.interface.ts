import { ValidatorFn } from '@angular/forms';

export interface ContezzaDynamicFormValidation {
    readonly id: string;
    readonly parameters?: any;
    readonly message: string;
    readonly validator?: ValidatorFn;
    readonly mask?;
}
