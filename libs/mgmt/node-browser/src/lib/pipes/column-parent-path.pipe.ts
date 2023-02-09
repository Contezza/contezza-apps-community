import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'parentPath',
    pure: true,
})
export class NodeBrowserColumnParentPathPipe implements PipeTransform {
    transform(path: string): string {
        if (path) {
            const split = path.split('/');

            return split.slice(0, split.length - 2).join('/');
        }

        return '';
    }
}
