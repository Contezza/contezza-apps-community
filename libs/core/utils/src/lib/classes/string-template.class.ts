import { ObjectUtils } from '@alfresco/adf-core';

import { ContezzaDependencySyntax } from '../collections';

export interface ContezzaStringTemplateSyntax {
    regex: RegExp;
    prefix: string;
    suffix: string;
    marker: string;
    groupValueSeparator?: string;
    specialSeparator?: string;
    propertySeparator?: string;
}

interface ParsedMatch {
    key: string;
    property: string;
}

export class ContezzaStringTemplate<ValueType> {
    readonly evaluate: (value: ValueType) => string;

    constructor(template: string, syntax: ContezzaStringTemplateSyntax = ContezzaDependencySyntax.StringTemplateSyntax) {
        const rawDependencies: string[] = template.match(syntax.regex);
        if (rawDependencies?.length) {
            this.evaluate = (value) =>
                template.replace(syntax.regex, (match) => {
                    const dependency: ParsedMatch = ContezzaStringTemplate.parseMatch(match, syntax);
                    return dependency.property && typeof value !== 'string' && typeof value !== 'number' ? ObjectUtils.getValue(value, dependency.property) ?? match : value;
                });
        } else {
            this.evaluate = (_) => template;
        }
    }

    private static parseMatch(
        match: string,
        syntax: ContezzaStringTemplateSyntax,
        separator: keyof Omit<ContezzaStringTemplateSyntax, 'regex'> = 'propertySeparator'
    ): ParsedMatch {
        const splitMatch = match.slice(syntax.marker.length + syntax.prefix.length, -syntax.suffix.length).split(syntax.propertySeparator);
        return splitMatch.length > 1
            ? {
                  key: splitMatch[0],
                  property: splitMatch.slice(1).join(syntax[separator]),
              }
            : { key: '', property: splitMatch[0] };
    }
}
