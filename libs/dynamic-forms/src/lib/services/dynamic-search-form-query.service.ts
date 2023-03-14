import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ObjectUtils } from '@alfresco/adf-core';

import { ContezzaIdResolverService } from '@contezza/core/extensions';
import { ContezzaArrayUtils, ContezzaStringTemplate } from '@contezza/core/utils';
import { ContezzaQuery, ContezzaQuerySource } from '@contezza/dynamic-forms/shared';

interface QuerySource {
    key: string;
    query?: (...args: any) => (_) => string;
    queryMap?: (...args: any) => (_: Observable<any>) => Observable<string>;
}

@Injectable({
    providedIn: 'root',
})
export class ContezzaDynamicSearchFormQueryService {
    private readonly SOURCE_TYPES: QuerySource[] = [
        {
            key: 'property',
            query: (property: ContezzaQuerySource['property'], key?: ContezzaQuerySource['key'], options?: ContezzaQuerySource['options']) =>
                ContezzaDynamicSearchFormQueryService.makeDefaultQuery(property, key, options),
        },
        {
            key: 'key',
            query: (key?: ContezzaQuerySource['key'], options?: ContezzaQuerySource['options']) => ContezzaDynamicSearchFormQueryService.makeDefaultQuery(undefined, key, options),
        },
        {
            key: 'template',
            query: (template: ContezzaQuerySource['template'], _?, options?: ContezzaQuerySource['options']) => (value) => {
                const t = new ContezzaStringTemplate(template);
                const queries = ContezzaArrayUtils.asArray(value).map((item) => t.evaluate(item));
                return queries.length > 1 ? '(' + queries.join(' ' + (options?.arrayJoiningStrategy || 'or').toUpperCase() + ' ') + ')' : queries[0];
            },
        },
        { key: 'map', queryMap: (source: ContezzaQuerySource['map']) => this.idResolver.resolve(source, 'map') },
    ];

    static makeDefaultQuery(property?: ContezzaQuerySource['property'], key?: ContezzaQuerySource['key'], options?: ContezzaQuerySource['options']): (value) => string {
        // TODO: expand options possibilities
        const queryPrefix = options?.exact ? '=' : '';
        const valuePrefix = options?.exact ? '' : '';
        const valueSuffix = options?.exact ? '' : '';
        const arrayJoiningStrategy = options?.arrayJoiningStrategy || 'or';
        return (value) => {
            const parsedValues = ContezzaArrayUtils.asArray(value).map((item) => (typeof item === 'object' && key ? ObjectUtils.getValue(item, key) : item));
            if (arrayJoiningStrategy === 'multiple') {
                return `${queryPrefix}${property}:"${parsedValues.map((item) => `${valuePrefix}${item}${valueSuffix}`).join()}"`;
            } else {
                const arrayJoiner = arrayJoiningStrategy.toUpperCase();
                return parsedValues.map((item) => (property ? `${queryPrefix}${property}:"${valuePrefix}${item}${valueSuffix}"` : item)).join(' ' + arrayJoiner + ' ');
            }
        };
    }

    constructor(private readonly idResolver: ContezzaIdResolverService) {}

    resolve(source: ContezzaQuerySource): ContezzaQuery {
        const sourceType = this.SOURCE_TYPES.find((type) => Object.keys(source).includes(type.key));
        if (sourceType) {
            if (sourceType.query) {
                const query = sourceType.query(source[sourceType.key], source.key, source.options);
                return (valueSource) => valueSource.pipe(map((value) => (value ? query(value) : '')));
            } else if (sourceType.queryMap) {
                const query = sourceType.queryMap(source[sourceType.key], source.key, source.options);
                return (valueSource) => query(valueSource);
            }
        }
        // TODO: the following has not yet been tested
        // if (source.and) {
        //     const maps = source.and.map((subsource) => this.resolve(subsource));
        //     return (value) => '(' + maps.map((map) => map(value)).join(' AND ') + ')';
        // }
        // if (source.or) {
        //     const maps = source.or.map((subsource) => this.resolve(subsource));
        //     return (value) => '(' + maps.map((map) => map(value)).join(' OR ') + ')';
        // }
        return undefined;
    }
}
