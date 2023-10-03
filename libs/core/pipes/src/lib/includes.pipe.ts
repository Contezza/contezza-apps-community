import { Pipe, PipeTransform } from '@angular/core';

import { DistributiveKeyof } from '@contezza/core/utils';

/**
 * Allows to use JS `in` operator in templates. Useful when working with TS union types.
 */
@Pipe({ standalone: true, name: 'includes' })
export class IncludesPipe implements PipeTransform {
    transform<T, TKey extends DistributiveKeyof<T>>(value: T, key: TKey): value is T & { [K in TKey]: any } {
        return key in value;
    }
}
