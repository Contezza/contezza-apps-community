import { Disjoint } from './disjoint.type';

/**
 * Tree structure. Generic-type parameters are:
 * * `LeafType`: type of leaf nodes
 * * `ChildrenKeys`: key(s) defining parent-children relation, e.g. `'children'` or `'subfields'`
 * * `BaseKeys`: key(s) required for both parent and leaf nodes, e.g. `'id' | 'type'`
 */
export type Tree<LeafType, ChildrenKeys extends string, BaseKeys extends '*' | keyof LeafType = never> = Pick<LeafType, BaseKeys extends '*' ? keyof LeafType : BaseKeys> &
    Disjoint<Omit<LeafType, BaseKeys extends '*' ? keyof LeafType : BaseKeys>, { [key in ChildrenKeys]: Tree<LeafType, ChildrenKeys, BaseKeys>[] }>;
