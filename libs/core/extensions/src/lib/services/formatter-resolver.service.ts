import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';

import { ContezzaObjectUtils, ContezzaUtils, DistributiveKeyof } from '@contezza/core/utils';

import { ContezzaIdResolverService, ContezzaIdResolverSource } from './id-resolver.service';

export type FormatterSource =
    | {
          /**
           * if the value is an object, then value[key] is used instead of the value itself
           */
          readonly key: string;
      }
    | {
          /**
           * string template, e.g. "PATH:'/app:company_home/st:sites/cm:${value.shortName}//*'"
           */
          readonly template: string;
      }
    | {
          /**
           * js function
           */
          readonly function: string;
      }
    | {
          /**
           * reference to a function registered via extensions service
           */
          readonly map: ContezzaIdResolverSource;
      };

export type Formatter<TRaw = any, TValue = any> = (value: TRaw) => Observable<TValue>;

type PickType<T, K extends DistributiveKeyof<T>> = T extends { [k in K]?: any } ? T[K] : undefined;
type Defs = {
    [K in DistributiveKeyof<FormatterSource>]: (source: PickType<FormatterSource, K>) => Formatter;
};

@Injectable({
    providedIn: 'root',
})
export class FormatterResolverService {
    private readonly keys: DistributiveKeyof<FormatterSource>[] = ['key', 'template', 'function', 'map'];
    private readonly defs: Defs = {
        key: (key) => (value) => of(ContezzaObjectUtils.getValue(value, key)),
        template: (template) => {
            const fn = ContezzaUtils.stringToFunction('value=>return value!=null?`' + template + '`:value');
            return (value) => of(fn(value));
        },
        function: (stringFn) => {
            const fn = ContezzaUtils.stringToFunction(stringFn);
            return (value) => of(fn(value));
        },
        map: (source) => {
            const operator = this.idResolver.resolve(source, 'map');
            return (value) => operator(of(value));
        },
    };

    constructor(private readonly idResolver: ContezzaIdResolverService) {}

    resolve(source: FormatterSource): Formatter {
        let i = 0;
        let formatter: Formatter<any, any>;
        while (!formatter && i < this.keys.length) {
            const key = this.keys[i];
            if (key in source) {
                formatter = this.defs[key](source[key]);
            }
            i++;
        }
        const throwError = (e: string | Error): never => {
            throw typeof e === 'string' ? new Error(e) : e;
        };
        return formatter ?? throwError('Formatter not correctly defined: ' + source);
    }
}
