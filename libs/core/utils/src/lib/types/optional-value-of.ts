/**
 * Returns the type of the value of `T[TKey]` if it exists, `T` otherwise.
 *
 * Useful in combination with types such as `Node | NodeEntry`, e.g. `OptionalValueOf<Node | NodeEntry, 'entry'>` equals `Node` as type.
 */
export type OptionalValueOf<T, TKey extends string> = T extends object ? (TKey extends keyof T ? T[TKey] : T) : T;
