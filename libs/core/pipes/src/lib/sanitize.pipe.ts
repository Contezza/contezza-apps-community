import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

enum Type {
    HTML = 'html',
    URL = 'url',
}

enum Method {
    SANITIZE_HTML = 'bypassSecurityTrustHtml',
    SANITIZE_URL = 'bypassSecurityTrustUrl',
}

const methodMapper: Record<Type, Method> = {
    [Type.HTML]: Method.SANITIZE_HTML,
    [Type.URL]: Method.SANITIZE_URL,
};

/**
 * Sanitizes the given string. This is necessary to use html texts or urls in an angular template.
 * The {@link Type} parameter defines the sanitizing method.
 */
@Pipe({ standalone: true, name: 'sanitize' })
export class SanitizePipe implements PipeTransform {
    constructor(private readonly sanitizer: DomSanitizer) {}

    transform(toSanitize: string, type: Type | `${Type}`): SafeUrl {
        return this.sanitizer[methodMapper[type]](toSanitize);
    }
}
