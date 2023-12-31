import { Injectable } from '@angular/core';

import * as rxjs from 'rxjs/operators';

import { ContezzaUtils } from '@contezza/core/utils';

@Injectable({
    providedIn: 'root',
})
export class ContezzaIdResolverService {
    private readonly registry: Record<string, Record<string, any>> = {};

    set<T>(values: Record<string, T>, type: string) {
        if (values) {
            if (!this.registry[type]) {
                this.registry[type] = {};
            }
            Object.assign(this.registry[type], values);
        }
    }

    resolve<T = any>(source: ContezzaIdResolverSource, type?: string, defaultValue?: T): T {
        let id: string;
        let parameters: any;
        if (typeof source === 'string') {
            id = source;
        } else {
            id = source.id;
            parameters = source.parameters;
        }
        let resolved = (type ? this.registry[type] : Object.values(this.registry).reduce((acc, val) => Object.assign(acc, val), {}))?.[id];
        if (!resolved && type === 'operator') {
            // if the source cannot be resolved and it is of type operator, then try to resolve it from rxjs/operators
            resolved = rxjs[id];
        }
        if (resolved) {
            // try to use parameters as callback
            return parameters !== undefined ? resolved((typeof parameters === 'string' && ContezzaUtils.stringToFunction(parameters)) || parameters) : resolved;
        } else {
            console.warn('Cannot resolve source ' + id + (type && ' of type ' + type));
            return defaultValue;
        }
    }
}

export interface ContezzaBaseSource {
    readonly id: string;
    readonly parameters?: any;
}

export type ContezzaIdResolverSource<T extends ContezzaBaseSource = ContezzaBaseSource> = string | T;
