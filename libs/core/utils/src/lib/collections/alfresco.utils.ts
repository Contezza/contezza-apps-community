import { Node, NodeEntry } from '@alfresco/js-api';

import type { Property } from '../classes';

export class AlfrescoUtils {
    static readonly prefixSpacesStore = 'workspace://SpacesStore/';

    /**
     * Turns the given id into a noderef by prefixing it with `workspace://SpacesStore/`.
     * If the given parameter already is a noderef then it is immediately returned.
     * N.B.: the parameter is assumed to be either an uuid or a noderef, no check is performed.
     *
     * @param id
     */
    static toNoderef(id: string): string {
        return id.includes('/') ? id : AlfrescoUtils.prefixSpacesStore + id;
    }

    /**
     * Checks whether the given node has the given aspect.
     *
     * @param node The {@link Node} or {@link NodeEntry} whose aspects must be checked.
     * @param aspect An aspect name.
     * @returns Whether the given node has the given aspect.
     */
    static hasAspect(node: Node | NodeEntry, aspect: string): boolean {
        const { aspectNames } = 'entry' in node ? node.entry : node;
        return !!aspectNames?.includes(aspect);
    }

    /**
     * Extracts a node property value.
     * The return type is inferred based on the given {@link Property} definition.
     *
     * @param node The {@link Node} or {@link NodeEntry} the property must be extracted from.
     * @param property A {@link Property} definition.
     * @returns Node property value with inferred type.
     */
    static getNodePropertyValue<TName extends string, TValue>(node: Node | NodeEntry, property: Property<TName, TValue>): TValue | null {
        const { properties } = 'entry' in node ? node.entry : node;
        const { name, parseValue } = property;
        const value = properties?.[name];
        return value !== null && value !== undefined ? parseValue(value) : null;
    }

    /**
     * Sets a property value on the local representation of a node. This does not affect the node in Alfresco.
     * It is useful to mimic the effect of an API call without needing to retrieve the node (or result list) again.
     *
     * @param node The {@link Node} or {@link NodeEntry} the property must be set in.
     * @param property A {@link Property} definition.
     * @param value The new value of the property.
     */
    static setNodePropertyValue<TName extends string, TValue>(node: Node | NodeEntry, property: Property<TName, TValue>, value: TValue) {
        const target = 'entry' in node ? node.entry : node;
        if (!target.properties) {
            target.properties = {};
        }
        const { name } = property;
        target.properties[name] = value;
    }
}
