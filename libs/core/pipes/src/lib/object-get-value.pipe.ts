import { Pipe, PipeTransform } from '@angular/core';

import { ContezzaObjectUtils } from '@contezza/core/utils';

@Pipe({ standalone: true, name: 'objectGetValue' })
export class ObjectGetValuePipe implements PipeTransform {
    transform(obj: Record<string, any>, key: string): any {
        return ContezzaObjectUtils.getValue(obj, key);
    }
}
