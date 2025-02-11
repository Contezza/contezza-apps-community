import { OrArray } from '../collections';
import { Split } from './split.type';

type GenericQueryParameter = OrArray<string | number>;

type _Number<T extends string> = T extends `${infer TNumber extends number}` ? TNumber : T;
type MapTuple<T extends string[]> = T extends [infer THead extends string, ...infer TTail extends string[]] ? [_Number<THead>, ...MapTuple<TTail>] : [];

type QueryParameter<T extends string = string> = string extends T ? GenericQueryParameter : T extends `${string},${string}` ? MapTuple<Split<T, ','>> : _Number<T>;

type _QueryParameters<T extends string> = {
    [Key in Split<T, '&'>[number] as Key extends `${infer TKey}=${string}` ? TKey : never]: Key extends `${string}=${infer TValue}` ? QueryParameter<TValue> : never;
};
type RemoveInitialQuestionMark<T extends string> = T extends `?${infer TSub}` ? TSub : T;

/**
 * Extracts the query-parameter type from the given string.
 */
export type QueryParameters<T extends string = string> = string extends T ? Record<string, GenericQueryParameter> : _QueryParameters<RemoveInitialQuestionMark<T>>;
