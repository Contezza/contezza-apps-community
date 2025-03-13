/**
 * Translation-file model. It is just an object whose elementary properties are strings.
 */
export interface Translation {
    [K: string]: string | Translation;
}

/**
 * Record of translation files. Each key represents a language.
 */
export type Translations<T extends Translation> = Record<string, T | Promise<T>>;
