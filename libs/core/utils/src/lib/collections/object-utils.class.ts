import { ObjectUtils } from '@alfresco/adf-core';
import { mergeObjects } from '@alfresco/adf-extensions';

import { ObjectEntry, Tree } from '../types';
import { ContezzaArrayUtils, OrArray } from './array-utils.class';

interface Replacer {
    replaced: string;
    replacer: any;
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
        const { getValue } = ContezzaObjectUtils;

        const { tagImportant, importsKey } = options;
        const keysWithImport = ContezzaObjectUtils.findKeys(object, (el) => el && typeof el === 'object' && importsKey in el);

        interface Import {
            id: string;
            prefixIds?: string;
            replace?: Replacer[];
        }

        if (keysWithImport.length) {
            // resolve array element matchers into array indexes
            keysWithImport.forEach((key) => {
                const objectWithImports = getValue(object, key);
                objectWithImports[importsKey] = ContezzaArrayUtils.asArray(objectWithImports[importsKey] as OrArray<string | Import>).map((importStringOrObject) => {
                    const importObject = typeof importStringOrObject === 'string' ? { id: importStringOrObject } : importStringOrObject;
                    let importId = importObject.id;

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
                            const array = getValue(object, subkey);
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

                    return { ...importObject, id: replaced + (important ? tagImportant : '') };
                });
            });

            // make base import trees
            const importTrees: Tree<{ id: string }, 'dependsOn', '*'>[] = keysWithImport.map((id) => ({
                id,
                dependsOn: ContezzaArrayUtils.asArray(getValue(object, id)[importsKey]).map((importObject) => ({
                    id: importObject.id.endsWith(tagImportant) ? importObject.id.slice(0, -tagImportant.length) : importObject.id,
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
            const processImportObject = (importObject: Import) => {
                // destructure to exclude id
                const { id, ...imported } = getValue(object, importObject.id.endsWith(tagImportant) ? importObject.id.slice(0, -tagImportant.length) : importObject.id);
                // deep copy to allow the imported object to be imported multiple times with different replacers
                const copy = JSON.parse(JSON.stringify(imported));
                const { replace, prefixIds } = importObject;

                // replace
                ContezzaObjectUtils.replace(copy, replace);

                // prefix ids
                if (prefixIds) {
                    const idKeys = ContezzaObjectUtils.findKeys(
                        copy,
                        (el) => typeof el === 'string',
                        (subtarget) => Object.entries(subtarget).filter(([key, val]) => val && (key === 'id' || typeof val === 'object'))
                    );
                    idKeys.forEach((idKey) => ContezzaObjectUtils.setValue(copy, idKey, prefixIds + ContezzaObjectUtils.getValue(copy, idKey)));
                }

                return copy;
            };
            const recursion = (tree: Tree<{ id: string }, 'dependsOn', '*'>) => {
                tree.dependsOn?.forEach((subtree) => recursion(subtree));
                const key = tree.id;
                if (keysWithImport.includes(key) && !processedKeys.includes(key)) {
                    const objectWithImports = getValue(object, key);
                    const [important, notImportant] = ContezzaArrayUtils.partition(objectWithImports[importsKey] as Import[], (importObject) =>
                        importObject.id.endsWith(tagImportant)
                    );
                    // merging order: not important imports < object self < important imports
                    // assign the result to the object self
                    Object.assign(objectWithImports, mergeObjects(...notImportant.map(processImportObject), objectWithImports, ...important.map(processImportObject)));
                    delete objectWithImports[importsKey];

                    processedKeys.push(key);
                }
            };
            importTrees.forEach((tree) => recursion(tree));
        }
    }

    /**
     * Replaces string (sub)values in the given object, using the given `replacers`. Any replacer consists of two properties, `replaced` and `replacer`. Any occurrence of the first will be replaced with the second.
     *
     * @param target An object whose string (sub)values must be replaced.
     * @param replacers A list of replacers.
     */
    static replace<T>(target: T, replacers: Replacer[] = []): T {
        if (replacers.length) {
            ContezzaObjectUtils.findKeys(target, (el) => typeof el === 'string').forEach((importedObjectKey) =>
                ContezzaObjectUtils.setValue(
                    target,
                    importedObjectKey,
                    replacers.reduce(
                        (acc, { replaced, replacer }) =>
                            // if the replaced fully matches the value, then it directly replaces the value
                            // this allows non-string replacer's to be effective
                            acc === replaced
                                ? replacer
                                : typeof acc === 'string'
                                ? // before turning the replaced into a regex, all special characters must be escaped
                                  acc.replace(new RegExp(replaced.replace(/[\!\#\$\%\^\&\*\)\(\+\=\.\<\>\{\}\[\]\:\;\'\"\|\~\`\_\-]/g, '\\$&'), 'g'), replacer)
                                : // this can only happen if the value has already been replaced with a non-string replacer
                                  // in this case we do nothing
                                  acc,
                        ContezzaObjectUtils.getValue(target, importedObjectKey)
                    )
                )
            );
        }
        return target;
    }
}
