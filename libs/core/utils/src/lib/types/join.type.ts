/**
 * Implements String.join() for types, i.e. transforms (unions of) tuple types in (unions of) string types.
 */
export type Join<Array extends unknown[], Separator extends string> = Array extends [infer First extends string | number, ...infer Tail]
    ? Tail extends [infer Second extends string | number, ...infer Rest]
        ? // if there is a following element
          `${First}${Separator}${Join<Tail, Separator>}`
        : // end of the array
          `${First}`
    : '';
