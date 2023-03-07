import { ObjectUtils } from '@alfresco/adf-core';

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
            return key ? ObjectUtils.getValue(target, key) : target;
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
     */
    static findKeys(target: any, evaluator: (_: any) => boolean, parser: (_: any) => [string, any][] = (subtarget) => Object.entries(subtarget)): string[] {
        const keys: string[] = [];
        const recursiveMap = (subtarget: any, path: string[] = []) => {
            if (evaluator(subtarget)) {
                keys.push(path.join('.'));
            } else if (typeof subtarget === 'object') {
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
}
