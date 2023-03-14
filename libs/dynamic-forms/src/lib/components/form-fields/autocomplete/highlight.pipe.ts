import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'highlight' })
export class HighlightPipe implements PipeTransform {
    transform(text: string, search): string {
        if (text && search) {
            // escapes chars that must be escaped + exclude content of html tags
            const pattern = search.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&') + '(?![^<>]*>)';
            const regex = new RegExp(pattern, 'gi');

            return text.replace(regex, (match) => `<b>${match}</b>`);
        } else {
            return text;
        }
    }
}
