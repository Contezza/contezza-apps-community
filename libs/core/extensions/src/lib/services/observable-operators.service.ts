import { Injectable } from '@angular/core';

import { of, OperatorFunction } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { ContezzaIdResolverService, ContezzaIdResolverSource } from './id-resolver.service';

/**
 * @deprecated
 */
@Injectable({
    providedIn: 'root',
})
export class ContezzaObservableOperatorsService {
    static readonly TYPE = 'operator';

    constructor(private readonly idResolver: ContezzaIdResolverService) {
        this.loadDefault();
    }

    loadDefault() {
        this.idResolver.set(
            {
                ifDefined: (operators: ContezzaIdResolverSource[]): OperatorFunction<any, any> =>
                    switchMap((obj) => (obj ? this.resolve(operators).reduce((acc, operator) => acc.pipe(operator), of(obj)) : of(obj))),
            },
            ContezzaObservableOperatorsService.TYPE
        );
    }

    resolve(operators: ContezzaIdResolverSource[]): OperatorFunction<any, any>[] {
        return operators?.map((flt) => this.idResolver.resolve(flt, ContezzaObservableOperatorsService.TYPE)) || [];
    }
}
