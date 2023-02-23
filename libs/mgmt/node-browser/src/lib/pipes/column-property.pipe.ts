import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'columnProperty',
    standalone: true,
    pure: true,
})
export class NodeBrowserColumnPropertyPipe implements PipeTransform {
    transform(element: any, key: string): string {
        return element && key ? this.resolvePath(element, key) : '';
    }

    private resolvePath(element, key): any {
        return key
            .split('.')
            .filter((p) => p)
            .reduce((o, p) => (o ? o[p] : ''), element);
    }
}
