/**
 * Disjoint union of `T1` and `T2`, i.e. object type with properties either in `T1` or in `T2` but not in both.
 */
export type Disjoint<T1, T2> = ({ [P in keyof T2]?: never } & { [P in keyof T1]: T1[P] }) | ({ [P in keyof T1]?: never } & { [P in keyof T2]: T2[P] });
