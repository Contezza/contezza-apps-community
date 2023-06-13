import { DistributiveKeyof } from './distributive-keyof.type';

/**
 * Variant of `Omit` which supports union types.
 * Source: https://dev.to/safareli/pick-omit-and-union-types-in-typescript-4nd9
 */
export type DistributiveOmit<T, K extends DistributiveKeyof<T>> = T extends unknown ? Omit<T, Extract<keyof T, K>> : never;
