type _ConstructTuple<Length extends number, T = unknown, Acc extends T[] = []> = Acc['length'] extends Length ? Acc : _ConstructTuple<Length, T, [...Acc, T]>;

/**
 * Builds a tuple of the given length. This is useful in other utility types which need arithmetic.
 */
export type ConstructTuple<Length extends number, T = unknown> = _ConstructTuple<Length, T>;
