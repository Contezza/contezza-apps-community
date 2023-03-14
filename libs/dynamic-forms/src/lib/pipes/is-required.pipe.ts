import { Pipe, PipeTransform } from '@angular/core';
import { Validators } from '@angular/forms';

import { ContezzaDynamicFormField } from '@contezza/dynamic-forms/shared';

@Pipe({ name: 'isRequired' })
export class IsRequiredPipe implements PipeTransform {
    transform(field: ContezzaDynamicFormField): boolean {
        return field?.validations?.filter((val) => val.validator === Validators.required)?.length > 0;
    }
}
