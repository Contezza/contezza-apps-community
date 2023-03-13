import { OperatorFunction } from 'rxjs';
import { filter, map, scan, startWith, tap } from 'rxjs/operators';

import { GenericBucket } from '@alfresco/js-api';
import { ObjectUtils } from '@alfresco/adf-core';

import moment from 'moment';

import { ContezzaArrayUtils } from './array-utils.class';
import { ContezzaObjectUtils } from './object-utils.class';
import { ContezzaStringTemplate } from '../classes';
import { DateRange } from '../interfaces';

export class ContezzaObservableOperators {
    static removeDuplicates = <T>(keys: string | string[]): OperatorFunction<T[], T[]> =>
        map((value: T[]) => value?.filter((item, pos, self) => self.findIndex((item2) => ContezzaArrayUtils.asArray(keys).every((key) => item[key] === item2[key])) === pos));

    static defined: OperatorFunction<any, any> = filter((value) => value !== undefined && value !== null);

    static startWith = startWith;

    static doNothing: OperatorFunction<any, any> = tap(() => {});

    static tapLog = tap((value) => console.log(value));

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

    static map = (property: string): OperatorFunction<any, any> =>
        map((value) => {
            if (value) {
                if (Array.isArray(value)) {
                    return value.map((entry) => (entry ? ContezzaObjectUtils.getValue(entry, property) : undefined));
                } else {
                    return value ? ContezzaObjectUtils.getValue(value, property) : undefined;
                }
            }
        });

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
        scan((oldList, newList) => {
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
            return oldList;
        }, []);
}
