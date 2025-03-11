import { Pipe, PipeTransform } from '@angular/core';

import { DynamicComponentExtensionService } from '@contezza/core/dynamic-component/shared';

@Pipe({
    standalone: true,
    name: 'isDefined',
})
export class IsDefinedPipe implements PipeTransform {
    constructor(private readonly dc: DynamicComponentExtensionService) {}

    transform(id: string): boolean {
        return this.dc.hasComponent(id);
    }
}
