import { ContezzaStringTemplateSyntax } from '../classes';

// format is: ${groupName.fieldName->fieldValueProperty.nestedProperty}
// allowing $ for special value e.g. form$valid
// allowing : as used in alfresco properties
// secondary dependencies are marked with $${...}
export class ContezzaDependencySyntax {
    static Regex = /\$+{[a-zA-Z0-9.:_\-]+(\$raw)?((->|\$)[a-zA-Z0-9.:_\-]+)?}/g;
    static RegexBase = /\$+{[a-zA-Z0-9.:_\-]+}/g;
    static Prefix = '{';
    static Suffix = '}';
    static Marker = '$';
    static GroupValueSeparator = '->';
    static SpecialSeparator = '$';
    static PropertySeparator = '.';
    static StringTemplateSyntax: ContezzaStringTemplateSyntax = {
        regex: ContezzaDependencySyntax.RegexBase,
        prefix: ContezzaDependencySyntax.Prefix,
        suffix: ContezzaDependencySyntax.Suffix,
        marker: ContezzaDependencySyntax.Marker,
        propertySeparator: ContezzaDependencySyntax.PropertySeparator,
    };
}
