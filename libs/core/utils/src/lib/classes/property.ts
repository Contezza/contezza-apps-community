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

type PropertyToRecord<TProperty extends Property<any, any>> = TProperty extends Property<infer TName, infer TValue>
    ? {
          [K in TName]: TValue;
      }
    : never;

export type Properties<TProperties extends Property<any, any>[]> = TProperties extends [infer THead extends Property<any, any>, ...infer TTail extends Property<any, any>[]]
    ? PropertyToRecord<THead> & Properties<TTail>
    : {};
