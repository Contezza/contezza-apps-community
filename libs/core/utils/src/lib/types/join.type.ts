/**
 * Implements String.join() for types, i.e. transforms (unions of) tuple types in (unions of) string types.
 */
export type Join<T extends string[], Separator extends string = ','> = T extends [infer Head extends string, ...infer Tail extends string[]]
    ? `${Head}${Separator}${Join<Tail, Separator>}`
    : '';
