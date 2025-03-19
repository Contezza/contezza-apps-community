import { Pipe, PipeTransform } from '@angular/core';

/**
 * Allows to use any function in a template, with the change-detection behaviour of a pure pipe.
 */
@Pipe({ standalone: true, name: 'apply' })
export class ApplyPipe implements PipeTransform {
    transform<TIn, TOut>(value: TIn, fn: (_: TIn) => TOut): TOut {
        return fn(value);
    }
}
