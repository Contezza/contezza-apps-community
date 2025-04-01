import { Pipe, PipeTransform } from '@angular/core';

import { PropertyDisplay } from '../models';
import { FormatterService } from '../services';

@Pipe({ standalone: true, name: 'displayProperty' })
export class DisplayPropertyPipe<TItem> implements PipeTransform {
    constructor(private readonly formatter: FormatterService) {}

    transform(item: TItem, propertyDisplay: PropertyDisplay) {
        return this.formatter.getValue(item, propertyDisplay);
    }
}
