import { Pipe, PipeTransform } from '@angular/core';

import { KeyOf, ObjectUtils, TypeOf } from '@contezza/core/utils';

/**
 * Wrapper for ObjectUtils.getValue.
 */
@Pipe({ standalone: true, name: 'getValue' })
export class GetValuePipe implements PipeTransform {
    transform<T, TKey extends KeyOf<T> & (string | number)[]>(target: T, ...keys: TKey): TypeOf<T, TKey> {
        // @ts-ignore
        // otherwise TS2321: Excessive stack depth comparing types...
        return ObjectUtils.getValue(target, ...keys);
    }
}
