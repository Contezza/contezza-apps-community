/**
 * Difference between `T` and `U`, i.e. object type with properties in `T` but not in `U`.
 */
export type Difference<T, U> = { [K in keyof T]: K extends keyof U ? never : T[K] };
