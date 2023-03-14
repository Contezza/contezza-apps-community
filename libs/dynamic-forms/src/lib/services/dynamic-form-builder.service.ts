import { Injectable } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';

import { ContezzaDynamicForm, ContezzaDynamicFormField, ContezzaDynamicFormValidation } from '@contezza/dynamic-forms/shared';

@Injectable({
    providedIn: 'root',
})
export class ContezzaDynamicFormBuilderService {
    build(dynamicForm: ContezzaDynamicForm) {
        if (!dynamicForm.built) {
            dynamicForm.build(this.makeFormFromFields(dynamicForm) as FormGroup);
        }
    }

    private makeFormFromFields(dynamicForm: ContezzaDynamicForm, field: ContezzaDynamicFormField = dynamicForm.rootField): AbstractControl {
        let control: AbstractControl;
        if (field.type === 'subform' && field.subfields) {
            const form = new FormGroup(
                {},
                {
                    validators: this.composeValidations(field.validations || []),
                }
            );
            field.subfields.forEach((subfield) => {
                const subcontrol: AbstractControl = this.makeFormFromFields(dynamicForm, subfield);
                form.addControl(subfield.id, subcontrol);
            });
            control = form;
        } else {
            control = new FormControl({ value: undefined, disabled: true }, this.composeValidations(field.validations || []));
        }
        return control;
    }

    private composeValidations(validations?: ContezzaDynamicFormValidation[]): ValidatorFn {
        if (validations?.length) {
            const validList = [];
            validations
                .filter((valid) => !!valid.validator)
                .forEach((valid) => {
                    validList.push(valid.validator);
                });
            return Validators.compose(validList);
        }
        return null;
    }
}
