/**
 * Variation of `keyof T` which includes nested objects. Format is `key.subkey`, compatible with `ContezzaObjectUtils.getValue()`.
 */
export type KeyOf<T> = T extends (infer ItemType)[]
    ? // if T is array
      `${bigint}` | `${bigint}.${KeyOf<ItemType>}`
    : T extends object
    ? // if T is object
      string extends keyof T
        ? // if T is any: necessary to prevent error 'Type instantiation is excessively deep and possibly infinite.'
          `${string}`
        : keyof T extends infer Key
        ? Key extends keyof T & (string | number)
            ? // if T is object with type
              `${Key}` | `${Key}.${KeyOf<T[Key]>}`
            : never
        : never
    : // any other type: number, string, function, ...
      never;
