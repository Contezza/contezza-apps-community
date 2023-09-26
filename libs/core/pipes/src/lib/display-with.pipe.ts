import { Pipe, PipeTransform } from '@angular/core';

/**
 * Allows to use any function in a template, with the change-detection behaviour of a pure pipe.
 */
@Pipe({ standalone: true, name: 'displayWith' })
export class DisplayWithPipe implements PipeTransform {
    transform<TIn, TOut>(value: TIn, displayFn: (_: TIn) => TOut): TOut {
        return displayFn(value);
    }
}
