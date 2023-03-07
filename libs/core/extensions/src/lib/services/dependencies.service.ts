import { Injectable } from '@angular/core';

import { combineLatest, Observable, of } from 'rxjs';
import { debounceTime, map, withLatestFrom } from 'rxjs/operators';

import { ContezzaArrayUtils, ContezzaDependencySyntax, ContezzaObjectUtils } from '@contezza/core/utils';

import { ContezzaDependency } from '../classes';

interface ParsedDependency {
    key: string;
    property: string;
}

class StringUtils {
    static warned = false;

    static replaceAll(value: string, oldWord: string, newWord: string): string {
        if ('replaceAll' in String.prototype) {
            return (value as any).replaceAll(oldWord, newWord);
        } else {
            if (!StringUtils.warned) {
                console.warn('String.prototype.replaceAll() is not available, using simplified implementation');
                StringUtils.warned = true;
            }
            return value.split(oldWord).join(newWord);
        }
    }
}

@Injectable({
    providedIn: 'root',
})
export class ContezzaDependenciesService {
    private dependencies: ContezzaDependency[];

    static find(text: string, regex = ContezzaDependencySyntax.Regex): ParsedDependency[] {
        return text.match(regex).map((match) => ContezzaDependenciesService.parse(match));
    }

    static parse(dependency: string): ParsedDependency {
        const splitDependency = dependency
            .split(ContezzaDependencySyntax.Suffix)
            .slice(0, -1)
            .join(ContezzaDependencySyntax.Suffix)
            .split(ContezzaDependencySyntax.Prefix)
            .slice(1)
            .join(ContezzaDependencySyntax.Prefix)
            .split(ContezzaDependencySyntax.GroupValueSeparator);
        return {
            key: splitDependency[0],
            property: splitDependency[1],
        };
    }

    static replace(text: string, data): any {
        const replacer = (match: string): any => {
            const dependency: ParsedDependency = ContezzaDependenciesService.parse(match);
            return dependency.property ? ContezzaObjectUtils.getValue(data[dependency.key], dependency.property) : data[dependency.key];
        };

        const matches = text.match(ContezzaDependencySyntax.Regex);
        if (matches.length === 1 && matches[0] === text) {
            // if the full text perfectly matches the regex
            return replacer(text);
        } else {
            return text.replace(ContezzaDependencySyntax.Regex, replacer);
        }
    }

    refactorDependencies(object: object, prefix?: string, dependencyMap?: Record<string, string>) {
        if (object) {
            Object.entries(object).forEach(([key, value]) => {
                if (value) {
                    if (typeof value === 'string') {
                        if (prefix) {
                            value = StringUtils.replaceAll(
                                value,
                                ContezzaDependencySyntax.Marker + ContezzaDependencySyntax.Prefix,
                                ContezzaDependencySyntax.Marker + ContezzaDependencySyntax.Prefix + prefix + ContezzaDependencySyntax.PropertySeparator
                            );
                        }
                        // base case: replace all dependencies
                        if (dependencyMap) {
                            Object.entries(dependencyMap).forEach(([dependencyKey, dependencyValue]) => {
                                [
                                    ContezzaDependencySyntax.GroupValueSeparator,
                                    ContezzaDependencySyntax.PropertySeparator,
                                    ContezzaDependencySyntax.SpecialSeparator,
                                    ContezzaDependencySyntax.Suffix,
                                ].forEach((endChar) => {
                                    const placeholder =
                                        ContezzaDependencySyntax.Marker +
                                        ContezzaDependencySyntax.Prefix +
                                        (prefix ? prefix + ContezzaDependencySyntax.PropertySeparator : '') +
                                        dependencyKey +
                                        endChar;
                                    const replacement = ContezzaDependencySyntax.Marker + ContezzaDependencySyntax.Prefix + dependencyValue + endChar;
                                    value = StringUtils.replaceAll(value, placeholder, replacement);
                                });
                            });
                        }
                        object[key] = value;
                    } else if (typeof value === 'object') {
                        this.refactorDependencies(value, prefix, dependencyMap);
                    }
                }
            });
        }
    }

    init() {
        this.dependencies = [];
    }

    /**
     * Makes new dependency objects (initializing their source) and adds them to the dependencies array, based on the given key list.
     * Already existing keys are not added a second time.
     *
     * @param dependencyKeys An array of strings to be used as dependency keys.
     */
    add(dependencyKeys: string[]) {
        dependencyKeys.forEach((key) => {
            if (!this.dependencies.some((item) => item.key === key)) {
                this.dependencies.push(new ContezzaDependency(key));
            }
        });
    }

    get(dependencyKeys?: string[]): ContezzaDependency[] {
        return dependencyKeys?.length ? this.dependencies.filter((dep) => dependencyKeys.includes(dep.key)) : this.dependencies;
    }

    processSource(source: any): Observable<any> {
        if (!source) {
            return of(source);
        }
        const keys: string[] = ContezzaObjectUtils.findKeys(source, (subsource) => typeof subsource === 'string');
        const values: string[] = keys.map((key) => ContezzaObjectUtils.getValue(source, key));
        const rawDependencies: string[] = values
            .map((subsource) => subsource.match(ContezzaDependencySyntax.Regex))
            .filter((value) => !!value)
            .flat();
        const [rawPrimaryDependencies, rawSecondaryDependencies] = ContezzaArrayUtils.partition(rawDependencies, (d) => !d.startsWith('$$'));

        if (rawDependencies?.length) {
            const dependencies: ParsedDependency[] = rawPrimaryDependencies.map((match) => ContezzaDependenciesService.parse(match));
            const dependencyKeys: string[] = dependencies.map((dep) => dep.key);
            this.add(dependencyKeys);
            const batch: ContezzaDependency[] = this.get(dependencyKeys);
            let secondaryBatch: ContezzaDependency[];
            if (rawSecondaryDependencies?.length) {
                const secondaryDependencies: ParsedDependency[] = rawSecondaryDependencies.map((match) => ContezzaDependenciesService.parse(match));
                const secondaryDependencyKeys: string[] = secondaryDependencies.map((dep) => dep.key);
                this.add(secondaryDependencyKeys);
                secondaryBatch = this.get(secondaryDependencyKeys);
            }
            return combineLatest(batch.map((item) => item.source)).pipe(
                // debouncing to ensure that a source with multiple dependency is evaluated only once
                debounceTime(0),
                withLatestFrom(combineLatest(secondaryBatch?.map((item) => item.source) ?? of(undefined))),
                map(([data, secondaryData]) => {
                    const parsedData = {};
                    batch.forEach(({ key }, index) => (parsedData[key] = data[index]));
                    secondaryBatch?.forEach(({ key }, index) => (parsedData[key] = secondaryData[index]));
                    return parsedData;
                }),
                map((data) => {
                    // we do not modify the original source
                    let output = JSON.parse(JSON.stringify(source));
                    if (keys) {
                        keys.forEach((key) => {
                            if (key) {
                                ContezzaObjectUtils.setValue(output, key, ContezzaDependenciesService.replace(ContezzaObjectUtils.getValue(source, key), data));
                            } else {
                                output = ContezzaDependenciesService.replace(source, data);
                            }
                        });
                    }
                    return output;
                })
            );
        } else if (rawSecondaryDependencies?.length) {
            throw new Error('Source ' + source + ' defines a secondary dependency but no primary dependency.');
        } else {
            return of(source);
        }
    }
}
