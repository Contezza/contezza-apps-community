import type { AlfrescoUtils } from '../collections';

/**
 * Models a property definition.
 * Useful in combination with objects having a generic list of untyped properties, to enforce typing.
 * See for instance {@link AlfrescoUtils.getNodePropertyValue}.
 */
export class Property<TName extends string, TValue> {
    constructor(
        readonly name: TName,
        readonly parseValue: (_: NonNullable<any>) => TValue,
    ) {}
}
