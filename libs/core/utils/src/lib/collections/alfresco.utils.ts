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
        return value ? parseValue(value) : null;
    }
}
