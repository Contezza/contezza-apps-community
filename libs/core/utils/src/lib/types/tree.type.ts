import { Disjoint } from './disjoint.type';
import { DistributiveKeyof } from './distributive-keyof.type';
import { DistributiveOmit } from './distributive-omit.type';

/**
 * Tree structure. Generic-type parameters are:
 * * `LeafType`: type of leaf nodes
 * * `ChildrenKeys`: key(s) defining parent-children relation, e.g. `'children'` or `'subfields'`
 * * `BaseKeys`: key(s) required for both parent and leaf nodes, e.g. `'id' | 'type'`
 */
export type Tree<LeafType, ChildrenKeys extends string, BaseKeys extends '*' | DistributiveKeyof<LeafType> = never> = Pick<
    LeafType,
    BaseKeys extends '*' ? keyof LeafType : BaseKeys
> &
    Disjoint<
        DistributiveOmit<LeafType, BaseKeys extends DistributiveKeyof<LeafType> ? BaseKeys : DistributiveKeyof<LeafType>>,
        { [key in ChildrenKeys]: Tree<LeafType, ChildrenKeys, BaseKeys>[] }
    >;
