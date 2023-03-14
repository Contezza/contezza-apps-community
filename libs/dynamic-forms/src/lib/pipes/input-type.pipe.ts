import { Pipe, PipeTransform } from '@angular/core';
import { ContezzaDynamicFormField } from '@contezza/dynamic-forms/shared';

@Pipe({ name: 'inputType' })
export class InputTypePipe implements PipeTransform {
    transform(field: ContezzaDynamicFormField): 'number' | 'text' {
        return field.type === 'int' || field.type === 'integer' || field.type === 'long' ? 'number' : 'text';
    }
}
