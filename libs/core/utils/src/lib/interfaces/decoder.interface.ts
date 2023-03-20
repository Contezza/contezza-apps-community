export interface Decoder<DecodedType, EncodedType> {
    decode(value: EncodedType): DecodedType;
    encode(value: DecodedType): EncodedType;
}
