import { KeyOf } from './key-of.type';

/**
 * Extracts a type from the given type by following the given keys.
 * It generalises `T[K]`: `TypeOf<T, [K]> = T[K]`, `TypeOf<T, [K, L]> = T[K][L]` and so on.
 */
export type TypeOf<T, TKey extends KeyOf<T> = []> = TKey extends [infer Head, ...infer Tail]
    ? Head extends keyof T
        ? Tail extends KeyOf<T[Head]>
            ? TypeOf<T[Head], Tail>
            : never
        : never
    : T;
