/**
 * Picks the `ValueType`-valued properties from T.
 */
export type PickByType<T, ValueType> = {
    [P in keyof T as T[P] extends ValueType | undefined ? P : never]: T[P];
};
