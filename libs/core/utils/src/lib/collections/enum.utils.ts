// utility types used by EnumUtils.safelyConvert
// move these to ../types if they are also needed elsewhere, but it seems improbable
type ExclusiveValues<U1, U2> = Exclude<U1, U2> | Exclude<U2, U1>;
type CompatibleUnions<U1, U2> = ExclusiveValues<U1, U2> extends never ? U1 : never;
type EnumValues<T extends string> = `${T}`;
type CompatibleEnums<E1 extends string, E2 extends string> = CompatibleUnions<EnumValues<E1>, EnumValues<E2>> extends never ? never : E1;

export class EnumUtils {
    /**
     * Wraps a conversion from one enum or string-union type to another.
     * Method signature ensures that the two types are actually the same.
     * Using this ensures that if the involved types are not compatible anymore (for instance due to a change in one of the two type definitions) then an error is thrown at compilation time.
     *
     * @param fromValue
     */
    static safelyConvert<TFrom extends string, TTo extends string>(fromValue: CompatibleEnums<TFrom, TTo>): TTo {
        return fromValue as any as TTo;
    }
}
