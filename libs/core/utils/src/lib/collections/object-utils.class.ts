import { ObjectUtils as AlfrescoObjectUtils } from '@alfresco/adf-core';

import { KeyOf, ObjectEntry, TypeOf } from '../types';

interface FindKeysOptions {
    parser: (_: any) => [string, any][];
    allowNestedKeys: boolean;
}

export class ObjectUtils {
    /**
     * Extracts a value from the given object by following the given keys, i.e. the first key is applied to the given object to obtain a second object, the second key is applied to this second object, and so on.
     *
     * @param target The object a value is being extracted from.
     * @param keys A list of keys used to parse the object.
     * @returns A value extracted from the given object by following the given keys.
     */
    static getValue<T, TKey extends KeyOf<T> & (string | number)[]>(target: T, ...keys: TKey): TypeOf<T, TKey> {
        let currentTarget: any = target;
        let index = 0;
        while (currentTarget && index < keys.length) {
            currentTarget = currentTarget[keys[index]];
            index++;
        }
        return currentTarget;
    }
}

export class ContezzaObjectUtils {
    /**
     * Wraps Alfresco ObjectUtils.getValue(target, key), in addition:
     * returns the object itself if the key is nullish,
     * returns undefined if an error is thrown.
     *
     * @param target
     * @param key
     */
    static getValue(target: any, key: string): any {
        try {
            return key ? AlfrescoObjectUtils.getValue(target, key) : target;
        } catch (e) {
            return undefined;
        }
    }

    static setValue(target: any, key: string, value: any): any {
        if (target) {
            if (key) {
                const splitKey = key.split('.');

                let targetProperty = target;
                for (let i = 0; i < splitKey.length - 1; i++) {
                    if (!targetProperty[splitKey[i]]) {
                        // if the following step is '0', then instantiate an array
                        if (splitKey[i + 1] === '0') {
                            targetProperty[splitKey[i]] = [];
                        } else {
                            targetProperty[splitKey[i]] = {};
                        }
                    }
                    targetProperty = targetProperty[splitKey[i]];
                }
                targetProperty[splitKey[splitKey.length - 1]] = value;

                return target;
            } else {
                // no key: the target itself is replaced
                return value;
            }
        } else {
            return undefined;
        }
    }

    /**
     * Returns the list of all nested keys of the target object whose values satisfy the given evaluator.
     * In other words, for every key returned by this method, evaluator(ContezzaObjectUtils.getValue(target, key)) is true.
     *
     * @param target The target object.
     * @param evaluator A boolean function, keys whose value satisfies this function are included in the output.
     * @param options Optional parameters are <ul><li>`parser` - Function defining how the target object must be parsed.</li><li>`allowNestedKeys` - Boolean parameter saying whether the parsing must go deeper once a match is found.</li></ul>
     */
    static findKeys<T>(target: T, evaluator: (_: any) => boolean, options: Partial<FindKeysOptions> = {}): string[] {
        const defaultOptions: FindKeysOptions = {
            parser: (subtarget) => Object.entries(subtarget),
            allowNestedKeys: false,
        };

        const { parser, allowNestedKeys } = Object.assign(defaultOptions, options);

        const keys: string[] = [];
        const recursiveMap = (subtarget: any, path: string[] = []) => {
            let match = false;
            if (evaluator(subtarget)) {
                match = true;
                keys.push(path.join('.'));
            }
            // if allowNestedKeys === true then we use 'match' to let this works as an 'else if'
            if ((allowNestedKeys || !match) && subtarget && typeof subtarget === 'object') {
                parser(subtarget).forEach(([key, val]) => {
                    // note: this recursion is not well-defined in general (an object may loop into itself)
                    recursiveMap(val, path.concat([key]));
                });
            }
        };
        recursiveMap(target);
        return keys;
    }

    /**
     * Returns (as a new object) the sub-object of the given object whose properties satisfy the given evaluator.
     *
     * @param target The object whose properties need to be filtered
     * @param evaluator A boolean function that evaluates the key-value pairs of the given object
     */
    static filter<T>(target: T, evaluator: (key: string, value: any) => boolean): Partial<T> {
        return Object.entries(target).reduce((acc, [key, val]) => {
            if (evaluator(key, val)) {
                acc[key] = val;
            }
            return acc;
        }, {});
    }

    /**
     * Returns an item of the given list whose properties are a superset of the properties of the given item.
     *
     * @param item
     * @param list
     */
    static findMatch<T>(item: Partial<T>, list: T[]): T | undefined {
        return list.find((item2) => Object.keys(item).every((key) => item[key] === item2[key]));
    }

    /**
     * Returns the index of the item of the given list whose properties are a superset of the properties of the given item. If no match is found then returns `-1`.
     *
     * @param item
     * @param list
     */
    static findIndexMatch<T>(item: Partial<T>, list: T[]): number {
        return list.findIndex((item2) => Object.keys(item).every((key) => item[key] === item2[key]));
    }

    /**
     * Builds an object from an array of key-value pairs. Inverse of Object.entries().
     *
     * @param entries Array of key-value pairs.
     */
    static fromEntries<T>(entries: ObjectEntry<T>[]): T {
        return entries.map(([key, value]) => ({ [key]: value })).reduce((acc, entry) => Object.assign(acc, entry), {} as T);
    }
}
