/**
 * Applies `Partial<>` to the given type and to the type of all of its properties.
 */
export type DeepPartial<T> = T extends object ? { [P in keyof T]?: DeepPartial<T[P]> } : T;
