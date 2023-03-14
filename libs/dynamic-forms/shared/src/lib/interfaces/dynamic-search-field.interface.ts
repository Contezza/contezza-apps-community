import { Observable } from 'rxjs';

import { ContezzaIdResolverSource } from '@contezza/core/extensions';

export interface ContezzaDynamicSearchField<ValueType = any> {
    readonly query: ContezzaQuery<ValueType>;
}

export type ContezzaQuery<ValueType = any> = (value: Observable<ValueType | undefined>) => Observable<string>;

export interface ContezzaExtendedDynamicSearchField {
    readonly query: ContezzaQuerySource;
}

export interface ContezzaQuerySource {
    /**
     * if the value is an object, then value[key] is used instead of the value itself
     */
    readonly key?: string;
    /**
     * the property (e.g. alfresco properties such as cm:name, cm:description, tza:zaaktypeOmschrijving, ...) to be matched
     */
    readonly property?: string;
    /**
     * string template, e.g. "PATH:'/app:company_home/st:sites/cm:${value.shortName}//*'"
     */
    readonly template?: string;
    /**
     * reference to a function registered via extensions service
     */
    readonly map?: ContezzaIdResolverSource;
    readonly and?: ContezzaQuerySource[];
    readonly or?: ContezzaQuerySource[];
    readonly options?: ContezzaQueryOptions;
}

export interface ContezzaQueryOptions {
    readonly exact?: boolean;
    readonly arrayJoiningStrategy?: ArrayJoiningStrategyType;
}

type ArrayJoiningStrategyType = 'or' | 'and' | 'multiple';
