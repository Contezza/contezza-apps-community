/**
 * Variant of `keyof` which supports union types. By default, when `keyof` is used with union type it will count only common keys.
 * Source: https://dev.to/safareli/pick-omit-and-union-types-in-typescript-4nd9
 */
export type DistributiveKeyof<T> = T extends unknown ? keyof T : never;
