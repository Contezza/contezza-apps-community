export interface TernJson {
    typeDefinitions: TypeDefinition[];
}

export interface TypeDefinition {
    /**
     * namespace name
     */
    '!name': string;
    /**
     * list of types
     */
    '!define': Record<string, ObjectType>;
    /**
     * services
     */
    [K: string]: SimpleType | string | Record<string, ObjectType>; // actually only Type
}

export interface BaseType {
    /**
     * java docs
     */
    '!doc'?: string;
    '!url'?: string;
}

export interface SimpleType extends BaseType {
    /**
     * type
     */
    '!type'?: string;
}

export interface ObjectType extends BaseType {
    /**
     * parent class
     */
    '!proto'?: string;
    /**
     * properties
     */
    [K: string]: SimpleType | string; // actually only SimpleType
}

export type Type = SimpleType | ObjectType;
