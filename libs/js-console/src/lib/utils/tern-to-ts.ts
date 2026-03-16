export type TernModel = { '!name': string } & Record<string, { '!doc'?: string } & ({ '!type': string } | Record<string, { '!doc'?: string; '!type': string }>)>;

export class TernToTs {
    static adapt(json: TernModel): string {
        let output = '';

        // namespace declaration
        output += `declare namespace ${json['!name']} {\n`;
        Object.entries(json)
            .filter(([key]) => !key.startsWith('!'))
            .forEach(([key, value]) => {
                // add docs
                if (value['!doc']) {
                    output += TernToTs.adaptDocs(value['!doc']);
                }
                if (key[0].toUpperCase() === key[0]) {
                    // if it starts with uppercase, then it is a class
                    output += `export class ${key} {\n`;
                    output += TernToTs.adaptProperties(value);
                    output += '}\n';
                } else {
                    // if it starts with lowercase, then it is a const
                    if (value['!type']) {
                        // const with elementary type
                        output += `export const ${key}:${TernToTs.adaptType(value['!type'])} ;\n`;
                    } else {
                        // const is object
                        output += `export const ${key}: {\n`;
                        output += TernToTs.adaptProperties(value);
                        output += '}\n';
                    }
                }
            });
        output += '}\n';

        // allow to use objects without namespace prefix
        Object.keys(json)
            .filter((key) => !key.startsWith('!'))
            .forEach((key) => (output += `import ${key}=${json['!name']}.${key};\n`));
        return output;
    }

    private static adaptDocs = (docs: string): string => `
                /**
                 * ${docs}
                 */
                `;

    private static adaptType = (type: string): string => {
        type = type.replace(/\?/g, 'any');
        if (type.includes('fn') && !type.includes('->')) {
            type += '=> void';
        }
        type = type.replace(/fn/g, '');
        type = type.replace(/->/g, '=>');
        return type;
    };

    private static adaptProperties = (value): string => {
        let output = '';
        Object.entries(value)
            .filter(([key2]) => !key2.startsWith('!'))
            .forEach(([key2, value2]) => {
                // add docs
                if (value2['!doc']) {
                    output += TernToTs.adaptDocs(value2['!doc']);
                }
                output += `${key2}: ${TernToTs.adaptType(value2['!type'])};\n`;
            });
        return output;
    };
}
