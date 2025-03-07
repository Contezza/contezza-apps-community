import { Injectable } from '@angular/core';

import { Observable, switchMap } from 'rxjs';

import { ArrayUtils, ContezzaObjectUtils } from '@contezza/core/utils';

import { ContezzaIdResolverService } from './id-resolver.service';

@Injectable({ providedIn: 'root' })
export class DynamicSourceExtensionService {
    constructor(private readonly idResolver: ContezzaIdResolverService) {}

    setOperators(values: Record<string, any>) {
        if (values) {
            this.idResolver.set(values, 'operator');
        }
    }

    setServiceOperators(values: Record<string, any>) {
        if (values) {
            const getFn = (service: object, fnName: string, error: string = `Function ${fnName} not found`): ((...args: any) => Observable<any>) => {
                const fn = service[fnName];
                if (!fn || typeof fn !== 'function') {
                    throw new Error(error);
                }
                return fn.bind(service);
            };
            this.setOperators(
                ContezzaObjectUtils.fromEntries<Record<string, any>>(
                    Object.entries(values).map(([key, service]) => [
                        key,
                        (method: string) => switchMap((args: any) => getFn(service, method, `Function ${method} not found in service ${key}`)(...ArrayUtils.asArray(args))),
                    ])
                )
            );
        }
    }

    setMaps(values: Record<string, any>) {
        if (values) {
            this.idResolver.set(values, 'map');
        }
    }

    setSourceTypes(values: Record<string, (value: string, options?: any) => Observable<any>>) {
        if (values) {
            this.idResolver.set(values, 'sourceType');
        }
    }
}
