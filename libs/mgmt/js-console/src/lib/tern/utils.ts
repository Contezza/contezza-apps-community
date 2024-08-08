import { StringUtils } from '@contezza/core/utils';

import { ObjectType, SimpleType, TernJson, TypeDefinition } from './models';

/**
 * Converts the tern file into a ts namespace definition.
 *
 * @param json
 */
export const ternToTs = (json: TernJson): string => {
    let output = '';

    //  output += adaptTypeDefinition(json.typeDefinitions[0]);
    json.typeDefinitions.forEach((typeDefinition) => (output += adaptTypeDefinition(typeDefinition)));

    return output;
};

const adaptTypeDefinition = (typeDefinition: TypeDefinition): string => {
    let output = '';

    const namespaceName = adaptNamespaceName(typeDefinition['!name']);

    // namespace declaration
    output += `declare namespace ${namespaceName} {\n`;

    // class definitions
    Object.entries(typeDefinition['!define'])
        .filter(([key]) => !key.startsWith('!'))
        .forEach(([key, value]) => (output += adaptClass(key, value)));

    // services
    const services = Object.entries(typeDefinition).filter(([key]) => !key.startsWith('!')) as [string, SimpleType][];
    services.forEach(([key, value]) => (output += adaptService(key, value)));
    output += '}\n';

    // allow to use services without namespace prefix
    services.forEach(([key]) => (output += `import ${key}=${namespaceName}.${key};\n`));

    return output;
};

const adaptNamespaceName = StringUtils.kebabCaseToCamelCase;

const adaptClass = (key: string, value: ObjectType): string => {
    let output = '';
    // add docs
    if (value['!doc']) {
        output += adaptDocs(value['!doc']);
    }
    const baseClass = '!proto' in value ? value['!proto'] : null;
    // export class
    output += `export class ${key}${baseClass ? ` extends ${baseClass}` : ''} {
                    ${adaptClassProperties(value)}
               }
               `;
    return output;
};

const adaptService = (key: string, value: SimpleType): string => {
    let output = '';
    // add docs
    if (value['!doc']) {
        output += adaptDocs(value['!doc']);
    }
    // define service as const
    output += `export const ${key}:${adaptType(value['!type'])};\n`;

    return output;
};

const adaptDocs = (docs: string): string => `
                /**
                 * ${docs}
                 */
                `;

const adaptClassProperties = (value: ObjectType): string => {
    let output = '';
    (Object.entries(value).filter(([key2]) => !key2.startsWith('!')) as [string, SimpleType][]).forEach(([key2, value2]) => {
        // add docs
        if (value2['!doc']) {
            output += adaptDocs(value2['!doc']);
        }
        output += `${adaptKey(key2)}: ${adaptType(value2['!type'])};\n`;
    });
    return output;
};

/**
 * Key adapter. Fixes:
 * * if the key contains a forbidden character then it is put between quotes, e.g. `cm:description` -> `"cm:description"`
 *
 * @param key
 */
const adaptKey = (key: string): string => (key.includes(':') ? `"${key}"` : key);

const adaptType = (type?: string): string => {
    if (!type) {
        return 'any';
    }
    type = type.replace(/\?/g, 'any');
    type = type.replace(/bool/g, 'boolean');
    type = type.replace(/\+Date/g, 'Date');
    if (type.includes('fn')) {
        // java may use js keywords as argument names
        // we prefix these with '_', e.g. fn(in) becomes fn(_in)
        type = type.replace(/(\s|_|\()in/g, (match) => match[0] + '_' + match.slice(1));
    }
    if (type.includes('fn') && !type.includes('->')) {
        type += '=> void';
    }
    type = type.replace(/fn/g, '');
    type = type.replace(/->/g, '=>');
    return type;
};
