import { Join, StringTemplate } from '../types';

export class StringUtils {
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
     * Returns the template-evaluation function defined by the given string.
     * This function takes as argument an object having the template parameters as keys and returns a `string`.
     * This function's typing ensures that only template parameters are accepted as inputs.
     * The template parameters are all optional and `any`-valued by default.
     * This can be changed using properties `requireAllParams` and `acceptOnlyString` of the `options` parameter.
     * Note for the developers: these properties may seem useless because they do not appear in the implementation of the function, but they are used for type inference.
     *
     * @param string
     * @param options
     */
    static readonly asTemplate = <T extends string, TRequireAllParams extends boolean = false, TAcceptOnlyString extends boolean = false>(
        string: T,
        // used for type inference!
        options?: { requireAllParams?: TRequireAllParams; acceptOnlyString?: TAcceptOnlyString }
    ): StringTemplate<T, TRequireAllParams, TAcceptOnlyString> => {
        // extracts template parameters from the given string
        const keys = string.match(/\$\{[^\}]*\}/g)?.map((key) => key.slice('${'.length, -'}'.length)) || [];
        // prepare template-evaluation function body
        const body = `const {${keys.join(',')}}=params;return \`${string}\``;
        return new Function('params', body) as StringTemplate<T, TRequireAllParams, TAcceptOnlyString>;
    };
}
