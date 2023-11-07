import { EMPTY, OperatorFunction, pipe, timer } from 'rxjs';
import { debounce, filter, map, pluck, scan, startWith, tap } from 'rxjs/operators';

import { GenericBucket } from '@alfresco/js-api';
import { ObjectUtils } from '@alfresco/adf-core';

import moment from 'moment';

import { ContezzaArrayUtils } from './array-utils.class';
import { ContezzaObjectUtils } from './object-utils.class';
import { ContezzaUtils } from './utils.class';
import { ContezzaStringTemplate } from '../classes';
import { DateRange } from '../interfaces';

export class ContezzaObservableOperators {
    /**
     * Implements a variation of rxjs `debounceTime` operator which allows to select the duration based on the difference between two emitted values.
     *
     * @param evaluator A function that evaluates the difference between two emitted values and returns the debounce duration. Duration `null` means that `debounce(EMPTY)` is used.
     */
    static debounceDiff = <T>(evaluator: (oldValue: T | undefined, newValue: T | undefined) => number | null): OperatorFunction<T, T> =>
        pipe(
            scan<T, [T, number | null]>(([oldValue], newValue) => [newValue, evaluator(oldValue, newValue)], [undefined, evaluator(undefined, undefined)]),
            debounce(([, time]) => (time !== null ? timer(time) : EMPTY)),
            pluck(0)
        );

    static removeDuplicates = <T>(keys: string | string[]): OperatorFunction<T[], T[]> =>
        map((value: T[]) => value?.filter((item, pos, self) => self.findIndex((item2) => ContezzaArrayUtils.asArray(keys).every((key) => item[key] === item2[key])) === pos));

    static defined: OperatorFunction<any, any> = filter((value) => value !== undefined && value !== null);

    static startWith = startWith;

    static doNothing: OperatorFunction<any, any> = tap(() => {});

    static tapLog = tap((value) => console.log(value));

    /**
     * Maps a JS `Date` into a `moment`.
     */
    static dateToMoment = map((date: Date) => moment(date));

    static parseJson: OperatorFunction<any, any> = map((value) => {
        try {
            return JSON.parse(value);
        } catch (e) {
            console.warn(e);
            return value;
        }
    });

    static parseDate: OperatorFunction<any, any> = map((value) => {
        try {
            return value && moment(value);
        } catch (e) {
            console.warn(e);
            return value;
        }
    });

    static parseDateRange: OperatorFunction<any, any> = map((value: { from: any; to: any }): DateRange => {
        const from = value.from && moment(value.from);
        const to = value.to && moment(value.to);
        return from || to
            ? {
                  from,
                  to,
              }
            : null;
    });

    static getValue = (property: string): OperatorFunction<any, any> => map((obj) => (obj ? ContezzaObjectUtils.getValue(obj, property) : obj));

    static template = (template: string): OperatorFunction<any, any> =>
        map((value) => new ContezzaStringTemplate(template).evaluate(typeof value === 'string' ? { value } : value));

    static map = (propertyOrCallback: string): OperatorFunction<any, any> => {
        const newFunction = ContezzaUtils.stringToFunction(propertyOrCallback);
        if (newFunction) {
            return map((...args) => newFunction(...args));
        } else {
            return map((value) => {
                if (value) {
                    if (Array.isArray(value)) {
                        return value.map((entry) => (entry ? ContezzaObjectUtils.getValue(entry, propertyOrCallback) : undefined));
                    } else {
                        return value ? ContezzaObjectUtils.getValue(value, propertyOrCallback) : undefined;
                    }
                }
            });
        }
    };

    static stringToObject = (property: string): OperatorFunction<string | string[], any> =>
        map((value) => {
            const stringToObjectBase = (str: string) => {
                const obj = {};
                obj[property] = str;
                return obj;
            };
            if (value) {
                if (Array.isArray(value)) {
                    return value.map((entry) => stringToObjectBase(entry));
                } else {
                    return stringToObjectBase(value);
                }
            }
            return undefined;
        });

    static anyToString: OperatorFunction<any, string> = map((value) => (value ? value.toString() : ''));

    static stringReplace = ({ replaced, replacer }): OperatorFunction<string, string> => map((value) => value.replace(replaced, replacer));

    static toLowerCase = map((value: string | string[]): string | string[] => (Array.isArray(value) ? value.map((item) => item.toLowerCase()) : value.toLowerCase()));

    static capitalize = (property: string): OperatorFunction<any, any> =>
        map((value) => {
            let propertyKey;
            let propertyPath;
            if (!property.includes('.')) {
                propertyPath = '';
                propertyKey = property;
            } else {
                const splitProperty = property.split('.');
                propertyKey = splitProperty.pop();
                propertyPath = splitProperty.join('.');
            }
            if (value) {
                (Array.isArray(value) ? value : [value]).forEach(
                    (item) =>
                        ((propertyPath ? ObjectUtils.getValue(item, propertyPath) : item)[propertyKey] = item[propertyKey]
                            .split(' ')
                            .map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase())
                            .join(' '))
                );
            }
            return value;
        });

    static isDateBeforeNow = <T>(property: string): OperatorFunction<T[], T[]> =>
        map((value) =>
            value?.filter((item) => {
                const date = ObjectUtils.getValue(item, property);
                return date
                    ? typeof date === 'string'
                        ? !moment(new Date(date)).isBefore(moment())
                        : !moment(`${date.year}/${date.monthValue}/${date.dayOfMonth}`, 'YYYY-MM-DD').isBefore(moment())
                    : true;
            })
        );

    static out = (blacklist: any[]): OperatorFunction<any, any> =>
        map((value) => value?.filter((item) => !blacklist.find((obj) => (typeof obj === 'object' ? Object.entries(obj).every(([key, val]) => item[key] === val) : item === obj))));

    static in = (whitelist: any[]): OperatorFunction<any, any> =>
        map((value) => value?.filter((item) => whitelist.find((obj) => (typeof obj === 'object' ? Object.entries(obj).every(([key, val]) => item[key] === val) : item === obj))));

    static sortBy = <T>(property: keyof T): OperatorFunction<T[], T[]> => tap((array) => ContezzaArrayUtils.sortBy(array, property));

    static or: OperatorFunction<any[], any | null> = map((array) => array.find((element) => !!element) || null);

    static renameProperties = (payload: { oldName: string; newName: string } | { oldName: string; newName: string }[]): OperatorFunction<any, any> =>
        tap((value) =>
            ContezzaArrayUtils.asArray(value).forEach((x) =>
                ContezzaArrayUtils.asArray(payload).forEach(({ oldName, newName }) => {
                    if (x[oldName]) {
                        x[newName] = x[oldName];
                        delete x[oldName];
                    }
                })
            )
        );

    static find = (properties: Record<string, any>): OperatorFunction<any[], any> =>
        map((list) => list.find((item) => Object.entries(properties).every(([key, value]) => item[key] === value)));

    static trackFacetBucketBy = (key: string): OperatorFunction<GenericBucket[], GenericBucket[]> =>
        scan((oldList: GenericBucket[], newList) => {
            oldList.forEach((oldItem) => {
                const matchingNewItem = newList?.find((newItem) => newItem[key] === oldItem[key]);
                if (matchingNewItem) {
                    // update every old item with new data
                    Object.assign(oldItem, matchingNewItem);
                } else {
                    // if no new data comes then set the count to 0
                    oldItem.metrics.forEach((metric) => (metric.value = { [metric.type]: '0' }));
                }
            });
            // push new elements in the list
            newList?.forEach((newItem) => {
                if (!oldList.some((oldItem) => newItem[key] === oldItem[key])) {
                    oldList.push(newItem);
                }
            });

            // always return the updated old list
            return oldList.sort((a, b) => {
                // sort by count
                const count = (x: GenericBucket): number => x.metrics.find(({ type }) => type === 'count')?.value.count || 0;
                return count(b) - count(a);
            });
        });
}
