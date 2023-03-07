/**
 * Difference between `T` and `U`, i.e. object type with properties in `T` but not in `U`.
 */
export type Difference<T, U> = { [K in keyof T]: K extends keyof U ? never : T[K] };

/**
 * Disjoint union of `T1` and `T2`, i.e. object type with properties either in `T1` or in `T2` but not in both.
 */
export type Disjoint<T1, T2> = ({ [P in keyof T2]?: never } & { [P in keyof T1]: T1[P] }) | ({ [P in keyof T1]?: never } & { [P in keyof T2]: T2[P] });

/**
 * Picks the `ValueType`-valued properties from T.
 */
export type PickByType<T, ValueType> = {
    [P in keyof T as T[P] extends ValueType | undefined ? P : never]: T[P];
};

/**
 * Tree structure. Generic-type parameters are:
 * * `LeafType`: type of leaf nodes
 * * `ChildrenKeys`: key(s) defining parent-children relation, e.g. `'children'` or `'subfields'`
 * * `BaseKeys`: key(s) required for both parent and leaf nodes, e.g. `'id' | 'type'`
 */
export type Tree<LeafType, ChildrenKeys extends string, BaseKeys extends keyof LeafType = never> = { [key in BaseKeys]: LeafType[key] } & Disjoint<
    Omit<LeafType, BaseKeys>,
    { [key in ChildrenKeys]: Tree<LeafType, ChildrenKeys, BaseKeys>[] }
>;
