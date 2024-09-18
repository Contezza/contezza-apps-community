/**
 * Generic type helper that ensures that the array contains at least one element of the given type T.
 */
export type NonEmptyArray<T> = [T, ...T[]];
