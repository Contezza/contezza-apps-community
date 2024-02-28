type ForbiddenChar = ' ' | '.' | ',' | '[' | '(' | '{' | '|' | '&' | '!' | '?';
type Key<TExpression extends string> = TExpression extends `${infer TKey}${ForbiddenChar}${string}` ? TKey : TExpression;

/**
 * Returns a tuple type whose entries are the template parameters of the string given as generic type.
 * E.g.: `StringTemplateParameters<'api/nodes/${nodeId}/children/${childId}'> = ['nodeId', 'childId']`
 *
 * By default, template parameters are identified by the placeholder notation of javascript template literals `${...}`.
 * This can be changed using the second type parameter.
 */
export type StringTemplateParameters<
    T extends string,
    TPlaceholder extends string = '${...}'
> = TPlaceholder extends `${infer TPrefix extends string}...${infer TSuffix extends string}`
    ? T extends `${string}${TPrefix}${infer TExpression extends string}${TSuffix}${infer Rest extends string}`
        ? [Key<TExpression>, ...StringTemplateParameters<Rest, TPlaceholder>]
        : []
    : never;

type ToFunction<T extends string[], TRequireAllKeys extends boolean, TAcceptOnlyStrings extends boolean> = TRequireAllKeys extends true
    ? (_: { [K in T[number]]: TAcceptOnlyStrings extends true ? string : any }) => string
    : (_: { [K in T[number]]?: TAcceptOnlyStrings extends true ? string : any }) => string;

/**
 * Returns the template evaluation-function type of the string given as generic type.
 * This function takes as argument an object having the template parameters as keys and returns a `string`.
 * E.g.: `StringTemplate<'api/nodes/${nodeId}/children/${childId}'> = (params: { nodeId; childId }) => string`
 *
 * By default, template parameters are identified by the placeholder notation of javascript template literals `${...}`.
 * This can be changed using the second type parameter.
 *
 * The template parameters are all optional and `any`-valued by default.
 * This can be changed using the third and fourth type parameters.
 */
export type StringTemplate<
    T extends string,
    TPlaceholder extends string = '${...}',
    TRequireAllParams extends boolean = false,
    TAcceptOnlyStrings extends boolean = false
> = ToFunction<StringTemplateParameters<T, TPlaceholder>, TRequireAllParams, TAcceptOnlyStrings>;
