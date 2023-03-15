/**
 * Pair where the first element is a key of `T` and the second element has the type of the corresponding value.
 * Refines the output type of Object.entries().
 * Source: https://github.com/type-challenges/type-challenges/issues/23749
 */
export type ObjectEntry<T> = keyof T extends infer P ? (P extends keyof T ? [P, Required<T>[P] extends never ? undefined : Required<T>[P]] : never) : never;
