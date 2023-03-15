type _Split<String extends string, Separator extends string, Acc extends string = ''> = String extends `${infer Head}${infer Rest}`
    ? Rest extends `${infer Second}${infer Tail}`
        ? Second extends Separator
            ? // if the second character is the separator
              [`${Acc}${Head}`, ..._Split<Tail, Separator>]
            : // if the second character is not the separator
              _Split<`${Second}${Tail}`, Separator, `${Acc}${Head}`>
        : // if there is no second character
          [`${Acc}${Head}`]
    : [];

/**
 * Implements String.split() for types, i.e. transforms (unions of) string types in (unions of) tuple types.
 */
export type Split<String extends string, Separator extends string> = _Split<String, Separator>;
