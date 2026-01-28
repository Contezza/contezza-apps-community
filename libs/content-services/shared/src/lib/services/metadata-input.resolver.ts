import { inject, Injectable, InjectionToken, Provider, Type } from '@angular/core';

import { map, Observable, of } from 'rxjs';

import { ArrayUtils, ContezzaObservables, OrArray } from '@contezza/core/utils';

/**
 * Input object for {@link MetadataComponent}.
 */
export interface MetadataInput<TItem> {
    item: TItem;
    propertyDisplayListId: string;
    actionId?: string;
}

type OrObservable<T> = T | Observable<T>;

export interface IMetadataInputResolver<TItem = unknown> {
    /**
     * Defines the priority order. The lower the value, the higher is the priority. If not defined then the resolver is applied with the lowest possible priority.
     */
    order?: number;
    /**
     * Evaluates whether the resolver is applicable to the given `source` and returns the corresponding {@link MetadataInput} object if this is the case.
     * It returns `null` otherwise.
     */
    resolve: (source: unknown) => OrObservable<null | MetadataInput<TItem>>;
}

const METADATA_INPUT_RESOLVER = new InjectionToken<IMetadataInputResolver[]>('METADATA_INPUT_RESOLVER');

/**
 * Registers the given {@link IMetadataInputResolver}'s in {@link MetadataInputResolver}.
 *
 * @param resolvers
 */
export function provideMetadataInputResolvers(resolvers: OrArray<IMetadataInputResolver | Type<IMetadataInputResolver>>): Provider[] {
    return ArrayUtils.asArray(resolvers).map(resolver =>
        typeof resolver === 'function'
            ? [
                  resolver,
                  {
                      provide: METADATA_INPUT_RESOLVER,
                      useExisting: resolver,
                      multi: true,
                  },
              ]
            : {
                  provide: METADATA_INPUT_RESOLVER,
                  useValue: resolver,
                  multi: true,
              },
    );
}

@Injectable({ providedIn: 'root' })
export class MetadataInputResolver implements IMetadataInputResolver {
    // constructor
    private readonly _resolvers: IMetadataInputResolver[] = inject(METADATA_INPUT_RESOLVER, { optional: true }) || [];

    private ordered = false;
    private get resolvers(): IMetadataInputResolver[] {
        // sort resolvers by order the first time they are get-ed
        if (!this.ordered) {
            // if `order` is not defined, then define it to be `MAX_SAFE_INTEGER - 1`
            // so that it is always sorted after all resolvers with a specific order
            // but reserve `MAX_SAFE_INTEGER` for resolvers with the lowest possible priority
            this._resolvers.forEach(def => (def.order ??= Number.MAX_SAFE_INTEGER - 1));
            ArrayUtils.sortBy(this._resolvers, 'order');
            this.ordered = true;
        }
        return this._resolvers;
    }

    resolve(source: unknown): Observable<null | MetadataInput<unknown>> {
        const { resolvers } = this;
        if (resolvers.length) {
            return ContezzaObservables.while<null | MetadataInput<unknown>>(
                (response, i) => response === null && i < resolvers.length,
                (_, i) => {
                    const resolver = resolvers[i]!;
                    return ContezzaObservables.of(resolver.resolve(source)).pipe(map(value => value ?? null));
                },
            );
        } else {
            return of(null);
        }
    }
}
