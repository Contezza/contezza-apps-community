import { Component, Input, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

import { ContezzaDynamicFormValidation } from '@contezza/dynamic-forms/shared';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: '[contezza-dynamic-form-field-error]',
    templateUrl: 'dynamic-form-field-error.component.html',
    styleUrls: ['dynamic-form-field-error.component.scss'],
    // TODO:
    // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicFormFieldErrorComponent implements OnInit {
    @Input()
    private readonly validations: ContezzaDynamicFormValidation[];

    requiredValidation: ContezzaDynamicFormValidation;
    otherValidations: ContezzaDynamicFormValidation[] = [];

    @Input()
    readonly control: FormControl;

    ngOnInit() {
        this.validations.forEach((validation) => {
            if (validation.validator === Validators.required) {
                this.requiredValidation = validation;
            } else {
                this.otherValidations.push(validation);
            }
        });
    }
}
