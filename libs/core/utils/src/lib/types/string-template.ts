type ForbiddenChar = ' ' | '.' | ',' | '[' | '(' | '{' | '|' | '&' | '!' | '?';
type Key<TExpression extends string> = TExpression extends `${infer TKey}${ForbiddenChar}${string}` ? TKey : TExpression;

/**
 * Returns a tuple type whose entries are the template parameters of the string given as generic type.
 * E.g.: `StringTemplateParameters<'api/nodes/${nodeId}/children/${childId}'> = ['nodeId', 'childId']`
 */
export type StringTemplateParameters<T extends string> = T extends `${string}\${${infer TExpression extends string}}${infer Rest extends string}`
    ? [Key<TExpression>, ...StringTemplateParameters<Rest>]
    : [];

type ToFunction<T extends string[], TRequireAllKeys extends boolean, TAcceptOnlyStrings extends boolean> = TRequireAllKeys extends true
    ? (_: { [K in T[number]]: TAcceptOnlyStrings extends true ? string : any }) => string
    : (_: { [K in T[number]]?: TAcceptOnlyStrings extends true ? string : any }) => string;

/**
 * Returns the template evaluation-function type of the string given as generic type.
 * This function takes as argument an object having the template parameters as keys and returns a `string`.
 * E.g.: `StringTemplate<'api/nodes/${nodeId}/children/${childId}'> = (params: { nodeId; childId }) => string`
 * The template parameters are all optional and `any`-valued by default.
 * This can be changed using the second and third type parameters.
 */
export type StringTemplate<T extends string, TRequireAllParams extends boolean = false, TAcceptOnlyStrings extends boolean = false> = ToFunction<
    StringTemplateParameters<T>,
    TRequireAllParams,
    TAcceptOnlyStrings
>;
