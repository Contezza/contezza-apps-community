import { mergeObjects } from '@alfresco/adf-extensions';

import { ContezzaArrayUtils, ContezzaObjectUtils, OrArray, Tree } from '@contezza/core/utils';

interface Replacer {
    replaced: string;
    replacer: any;
}

export class Utils {
    /**
     * Processes the given object resolving imports between subobjects.
     *
     * @param object
     * @param options
     */
    static resolveImports<T>(object: T, options: { tagImportant: string; importsKey: string } = { tagImportant: '!important', importsKey: 'imports' }) {
        const { getValue } = ContezzaObjectUtils;

        const { tagImportant, importsKey } = options;
        const keysWithImport = ContezzaObjectUtils.findKeys(object, (el) => el && typeof el === 'object' && importsKey in el, { allowNestedKeys: true });

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

            // add dependencies for nested keys
            importTrees.forEach((tree, i, trees) => tree.dependsOn.push(...trees.filter((tree2) => tree2 !== tree).filter((tree2) => tree.id.startsWith(tree2.id))));

            // detect circular dependencies
            try {
                JSON.stringify(importTrees);
            } catch (e) {
                throw new Error('Circular dependency detected while processing object imports.');
            }

            // follow the import trees to resolve the dependencies
            const processedKeys = [];
            const processImportObject = (importObject: Import) => {
                const value = getValue(object, importObject.id.endsWith(tagImportant) ? importObject.id.slice(0, -tagImportant.length) : importObject.id);
                if (typeof value === 'object') {
                    // destructure to exclude id
                    const { id, ...imported } = getValue(object, importObject.id.endsWith(tagImportant) ? importObject.id.slice(0, -tagImportant.length) : importObject.id);
                    // deep copy to allow the imported object to be imported multiple times with different replacers
                    const copy = JSON.parse(JSON.stringify(imported));
                    const { replace, prefixIds } = importObject;

                    // replace
                    Utils.replace(copy, replace);

                    // prefix ids
                    if (prefixIds) {
                        const idKeys = ContezzaObjectUtils.findKeys(copy, (el) => typeof el === 'string', {
                            parser: (subtarget) => Object.entries(subtarget).filter(([key, val]) => val && (key === 'id' || typeof val === 'object')),
                        });
                        idKeys.forEach((idKey) => ContezzaObjectUtils.setValue(copy, idKey, prefixIds + ContezzaObjectUtils.getValue(copy, idKey)));
                    }

                    return copy;
                } else {
                    return { 'tmp-wrapper-key': value };
                }
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

                    if ('tmp-wrapper-key' in objectWithImports) {
                        ContezzaObjectUtils.setValue(object, key, objectWithImports['tmp-wrapper-key']);
                    }

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
