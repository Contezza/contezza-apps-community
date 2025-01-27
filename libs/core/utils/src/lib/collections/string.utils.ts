import { Join, StringFormatConversion, StringTemplate } from '../types';

export class StringUtils {
    /**
     * Transforms the given string from camel case to kebab case.
     *
     * @param string
     */
    static camelToKebab<T extends string>(string: T): StringFormatConversion.CamelToKebab<T> {
        return string.replace(/[A-Z]+(?![a-z])|[A-Z]/g, ($, ofs) => (ofs ? '-' : '') + $.toLowerCase()) as StringFormatConversion.CamelToKebab<T>;
    }

    /**
     * Transforms the given string from kebab case to camel case.
     *
     * @param string
     */
    static kebabToCamel<T extends string>(string: T): StringFormatConversion.KebabToCamel<T> {
        return string.replace(/-./g, (x) => x[1]!.toUpperCase()) as StringFormatConversion.KebabToCamel<T>;
    }

    /**
     * Concatenates the given strings. Returns the same output as the `+` operators, but the output respects any string-literal type among the inputs.
     * E.g.:
     * ```
     * const x = 'foo'; // : 'foo'
     * const y = 'bar'; // : 'bar'
     * const z1 = x + y; // : string
     * const z2 = StringUtils.concat(x, y); // : 'foobar'
     * ```
     * Source: https://dev.to/ncpa0cpl/typescript-concatenate-multiple-string-literals-c59
     *
     * @param strings
     */
    static readonly concat = <T extends string[]>(...strings: T): Join<T, ''> => strings.join('') as Join<T, ''>;

    /**
     * @deprecated Use `ApiUtils.concatPath` instead.
     */
    static readonly concatPath = <T extends string[]>(...strings: T): Join<T, '/'> => strings.join('/') as Join<T, '/'>;

    /**
     * Returns a copy of the given string with all special characters escaped, so that the new string can be used as part of a RegExp.
     *
     * @param string
     */
    static readonly escapeRegExp = (string: string): string => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string

    /**
     * Returns the template-evaluation function defined by the given string.
     * This function takes as argument an object having the template parameters as keys and returns a `string`.
     * This function's typing ensures that only template parameters are accepted as inputs.
     *
     * By default, template parameters are identified by the placeholder notation of javascript template literals `${...}`.
     * This can be changed using property `placeholder` of the `options` parameter.
     *
     * The template parameters are all optional and `any`-valued by default.
     * This can be changed using properties `requireAllParams` and `acceptOnlyString` of the `options` parameter.
     * Note for the developers: these properties may seem useless because they do not appear in the implementation of the function, but they are used for type inference.
     *
     * @param string
     * @param options
     */
    static readonly toTemplate = <T extends string, TPlaceholder extends string = '${...}', TRequireAllParams extends boolean = false, TAcceptOnlyString extends boolean = false>(
        string: T,
        // used for type inference!
        options?: { placeholder?: TPlaceholder; requireAllParams?: TRequireAllParams; acceptOnlyString?: TAcceptOnlyString }
    ): StringTemplate<T, TPlaceholder, TRequireAllParams, TAcceptOnlyString> => {
        // only triggered when/if the template is evaluated
        const makeBody = () => {
            // prepare placeholder settings
            const defaultPrefix = '${';
            const defaultSuffix = '}';
            const defaultPlaceholder = StringUtils.concat(defaultPrefix, '...', defaultSuffix);
            const [prefix, suffix] = options?.placeholder?.split('...') || [defaultPrefix, defaultSuffix];
            const escapedPrefix = StringUtils.escapeRegExp(prefix);
            const escapedSuffix = StringUtils.escapeRegExp(suffix);
            const placeholderRegex = new RegExp(`${escapedPrefix}[^${escapedSuffix}]*${escapedSuffix}`, 'g');
            // extracts template parameters from the given string
            const keys = string.match(placeholderRegex)?.map((placeholder) => placeholder.slice(prefix.length, -suffix.length)) || [];
            // if the string uses a non-default placeholder then this must be replaced with the default
            const stringWithDefaultPlaceholder =
                options?.placeholder !== defaultPlaceholder
                    ? string.replace(placeholderRegex, (placeholder) => defaultPrefix + placeholder.slice(prefix.length, -suffix.length) + defaultSuffix)
                    : string;
            // prepare template-evaluation function body
            return `const {${keys.join(',')}}=params;return \`${stringWithDefaultPlaceholder}\``;
        };
        let body: string;
        return ((params) => {
            body ??= makeBody();
            return new Function('params', body)(params);
        }) as StringTemplate<T, TPlaceholder, TRequireAllParams, TAcceptOnlyString>;
    };

    /**
     * @deprecated Use `ApiUtils.toEndpointTemplate` instead.
     */
    static readonly toEndpointTemplate = <T extends string>(string: T) => StringUtils.toTemplate(string, { placeholder: '{...}', requireAllParams: true, acceptOnlyString: true });
}
