import { ObjectUtils } from '@alfresco/adf-core';
import { mergeObjects } from '@alfresco/adf-extensions';

import { ObjectEntry, Tree } from '../types';
import { ContezzaArrayUtils } from './array-utils.class';

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
            } else if (subtarget && typeof subtarget === 'object') {
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

    /**
     * Processes the given object resolving imports between subobjects.
     *
     * @param object
     * @param options
     */
    static resolveImports<T>(object: T, options: { tagImportant: string; importsKey: string } = { tagImportant: '!important', importsKey: 'imports' }) {
        const { tagImportant, importsKey } = options;
        const keysWithImport = ContezzaObjectUtils.findKeys(object, (el) => el && typeof el === 'object' && importsKey in el);

        // resolve array element matchers into array indexes
        keysWithImport.forEach((key) => {
            const objectWithImports = ContezzaObjectUtils.getValue(object, key);
            objectWithImports[importsKey] = ContezzaArrayUtils.asArray(objectWithImports[importsKey]).map((importId) => {
                let important = false;
                if (importId.endsWith(tagImportant)) {
                    important = true;
                    importId = importId.slice(0, -tagImportant.length);
                }

                let text = importId;
                let replaced;

                while (text !== replaced) {
                    if (replaced) {
                        text = replaced;
                    }
                    replaced = text.replace(/\[[^\[\]]*\]/, (match: string, offset: number, s: string) => {
                        const subkey = s.substring(0, offset);
                        const array = ContezzaObjectUtils.getValue(object, subkey);
                        if (!Array.isArray(array)) {
                            throw new Error('Object element with key ' + subkey + ' is expected to be an array.');
                        }
                        let index!: number;
                        const slicedKey = match.slice(1, -1);
                        try {
                            index = ContezzaObjectUtils.findIndexMatch(JSON.parse(slicedKey), array);
                        } catch (e) {
                            index = array.findIndex((item) => item.id === slicedKey);
                        }
                        if (index === -1) {
                            throw new Error('No matching import for key ' + s);
                        }
                        return '.' + index;
                    });
                }
                if (!replaced) {
                    replaced = text;
                }

                return replaced + (important ? tagImportant : '');
            });
        });

        // make base import trees
        const importTrees: Tree<{ id: string }, 'dependsOn', '*'>[] = keysWithImport.map((id) => ({
            id,
            dependsOn: ContezzaArrayUtils.asArray(ContezzaObjectUtils.getValue(object, id)[importsKey]).map((importId) => ({
                id: importId.endsWith(tagImportant) ? importId.slice(0, -tagImportant.length) : importId,
            })),
        }));

        // chain dependencies in import trees
        importTrees.forEach((tree) => tree.dependsOn.forEach((dep) => (dep.dependsOn = importTrees.filter(({ id }) => id.startsWith(dep.id)))));

        // detect circular dependencies
        try {
            JSON.stringify(importTrees);
        } catch (e) {
            throw new Error('Circular dependency detected while processing object imports.');
        }

        // follow the import trees to resolve the dependencies
        const processedKeys = [];
        const recursion = (tree: Tree<{ id: string }, 'dependsOn', '*'>) => {
            tree.dependsOn?.forEach((subtree) => recursion(subtree));
            const key = tree.id;
            if (keysWithImport.includes(key) && !processedKeys.includes(key)) {
                const objectWithImports = ContezzaObjectUtils.getValue(object, key);
                const [important, notImportant] = ContezzaArrayUtils.partition(ContezzaArrayUtils.asArray(objectWithImports[importsKey]), (importKey) =>
                    importKey.endsWith(tagImportant)
                );
                // merging order: not important imports < object self < important imports
                // assign the result to the object self
                Object.assign(
                    objectWithImports,
                    mergeObjects(
                        ...notImportant.map((importKey) => {
                            const { id, ...imported } = ContezzaObjectUtils.getValue(object, importKey);
                            return imported;
                        }),
                        objectWithImports,
                        ...important.map((importKey) => {
                            const { id, ...imported } = ContezzaObjectUtils.getValue(object, importKey.slice(0, -tagImportant.length));
                            return imported;
                        })
                    )
                );
                delete objectWithImports[importsKey];

                processedKeys.push(key);
            }
        };
        importTrees.forEach((tree) => recursion(tree));
    }
}
