import { Pipe, PipeTransform } from '@angular/core';

/**
 * @deprecated use {@link ApplyPipe} instead
 */
@Pipe({ standalone: true, name: 'displayWith' })
export class DisplayWithPipe implements PipeTransform {
    transform<TIn, TOut>(value: TIn, displayFn: (_: TIn) => TOut): TOut {
        return displayFn(value);
    }
}
