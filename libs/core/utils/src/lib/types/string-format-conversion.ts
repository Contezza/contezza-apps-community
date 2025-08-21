export namespace StringFormatConversion {
    /**
     * Converts the given string from camelCase to kebab-case.
     * @template T The string to convert the case.
     * @see https://gist.github.com/albertms10/09f14ef7ebdc3ce0e95683c728616253
     * @example
     * type Kebab = CamelToKebab<'exampleVarName'>;
     * // 'example-var-name'
     */
    export type CamelToKebab<T extends string> = T extends `${infer H}${infer J}`
        ? J extends Uncapitalize<J>
            ? `${Uncapitalize<H>}${CamelToKebab<J>}`
            : `${Uncapitalize<H>}-${CamelToKebab<J>}`
        : '';

    /**
     * Converts the given string from camelCase to UPPER_SNAKE_CASE.
     * @template T The string to convert the case.
     * @example
     * type Camel = CamelToUpperSnake<'exampleVarName'>;
     * // 'EXAMPLE_VAR_NAME'
     */
    export type CamelToUpperSnake<T extends string> = T extends `${infer H}${infer J}`
        ? J extends Uncapitalize<J>
            ? `${Capitalize<H>}${CamelToUpperSnake<J>}`
            : `${Capitalize<H>}_${CamelToUpperSnake<J>}`
        : '';

    /**
     * Converts the given string from kebab-case to camelCase.
     * @template T The string to convert the case.
     * @see https://gist.github.com/albertms10/09f14ef7ebdc3ce0e95683c728616253
     * @example
     * type Camel = KebabToCamel<'example-var-name'>;
     * // 'exampleVarName'
     */
    export type KebabToCamel<T extends string> = T extends `${infer H}-${infer J}${infer K}` ? `${Uncapitalize<H>}${Capitalize<J>}${KebabToCamel<K>}` : T;
}
