import { ValidatorFn } from '@angular/forms';

export interface ContezzaDynamicFormValidation {
    readonly id: string;
    readonly message: string;
    readonly validator?: ValidatorFn;
    readonly mask?;
}
