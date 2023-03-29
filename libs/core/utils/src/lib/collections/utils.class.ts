import { InjectableType, Injector, Optional, Provider, SkipSelf } from '@angular/core';

export class ContezzaUtils {
    static readonly REGEX_UUID = '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}';

    static readonly isUUID = (id: string): boolean => id.match(`^${ContezzaUtils.REGEX_UUID}$`) !== null;

    static get baseUrl(): string {
        const rawUri = window.location.href;
        const splitUri = rawUri.split('/');
        const hashIndex = splitUri.findIndex((x) => x.endsWith('#'));
        return splitUri.slice(0, hashIndex).join('/');
    }

    static splitFileName(name: string): [string, string] {
        const splitName = name.split('.');
        const extension = splitName.length > 1 ? splitName.pop() : '';
        const nameWithoutExtension = splitName.join('.');
        return [nameWithoutExtension, extension];
    }

    /**
     * Get file extension from the string.
     * Supports the URL formats like:
     * http://localhost/test.jpg?cache=1000
     * http://localhost/test.jpg#cache=1000
     *
     * @param fileName - file name
     */
    static getFileExtension(fileName: string): string {
        if (fileName) {
            // noinspection RegExpRedundantEscape
            const match = fileName.match(/\.([^\./\?\#]+)($|\?|\#)/);
            return match ? match[1] : null;
        }
        return null;
    }

    /**
     * Convert a string from label format to id format
     * e.g. APP.EXAMPLE.AN_EXAMPLE becomes anExample
     *
     * @param x
     */
    static labelToId = (x: string): string =>
        x
            .split('.')
            .pop()
            .toLowerCase()
            // snake_case to camelCase
            .replace(/_./g, (match) => match[1].toUpperCase());

    /**
     * Parses a string as a function. The string must contain `=>`, otherwise returns `undefined`. Throws an error if the `Function`-constructor call fails.
     *
     * @param f A string to be parsed as a function.
     */
    // eslint-disable-next-line @typescript-eslint/ban-types
    static stringToFunction = (f: string): Function | undefined => {
        if (f.includes('=>')) {
            const split = f.split('=>').map((x) => x.trim());
            const parsedArgs = split[0].match(/^\(.*\)$/) ? split[0].slice(1, -1) : split[0];
            const body = split.slice(1).join('=>');
            try {
                return new Function(parsedArgs, body);
            } catch (e) {
                throw new Error(`Failed to parse ${f} as a function. Detected arguments: ${parsedArgs}, body: ${body}`);
            }
        } else {
            return undefined;
        }
    };

    /**
     * If the given Injectable is not provided, then provides it.
     *
     * @param type
     */
    static ifnProvide = <T extends object>(type: InjectableType<T>): Provider => ({
        provide: type,
        useFactory: (parentInjector: Injector, service?: T) => service || Injector.create({ providers: [{ provide: type }], parent: parentInjector }).get(type),
        deps: [Injector, [new Optional(), new SkipSelf(), type]],
    });
}
