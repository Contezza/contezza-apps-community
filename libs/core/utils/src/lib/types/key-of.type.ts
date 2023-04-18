import { ConstructTuple } from './construct-tuple.type';

type _KeyOf<T, Depth extends any[]> = Depth extends [infer Head, ...infer Tail]
    ? T extends (infer ItemType)[]
        ? // if T is array
          `${bigint}` | `${bigint}.${_KeyOf<ItemType, Tail>}`
        : T extends object
        ? // if T is object
          string extends keyof T
            ? // if T is any: necessary to prevent error 'Type instantiation is excessively deep and possibly infinite.'
              `${string}`
            : keyof T extends infer Key
            ? Key extends keyof T & (string | number)
                ? // if T is object with type
                  `${Key}` | `${Key}.${_KeyOf<T[Key], Tail>}`
                : never
            : never
        : // any other type: number, string, function, ...
          never
    : never;

/**
 * Variation of `keyof T` which includes nested objects. Format is `key.subkey`, compatible with `ContezzaObjectUtils.getValue()`.
 * `Depth` parameter prevents 'error TS2589: Type instantiation is excessively deep and possibly infinite.' by tree-like types.
 */
export type KeyOf<T, Depth extends number = 15> = _KeyOf<T, ConstructTuple<Depth>>;
