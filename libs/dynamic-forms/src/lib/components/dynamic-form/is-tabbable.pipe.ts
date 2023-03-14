import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'isTabbable',
})
export class IsTabbablePipe implements PipeTransform {
    transform(classList: string): boolean {
        const tabbableClasses = ['dynamicforms-expansionpanel'];
        return tabbableClasses.some((className) => classList?.includes(className));
    }
}
