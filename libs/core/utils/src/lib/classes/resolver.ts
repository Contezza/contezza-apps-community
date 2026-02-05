import { InjectionToken, Provider, Type } from '@angular/core';

import { map, Observable, of } from 'rxjs';

import { ArrayUtils, ContezzaObservables } from '../collections';

type OrObservable<T> = T | Observable<T>;

/**
 * Types a function which evaluates whether a resolver is applicable to a given `source` and returns the corresponding resolved `resource` if this is the case, or `null` otherwise.
 */
export type ResolverFunction<TSource, TResource> = (source: TSource) => OrObservable<null | TResource>;

/**
 * Models a resolver, which consists of a {@link ResolverFunction} and optionally a priority order.
 */
export interface IResolver<TSource, TResource> {
    /**
     * Defines the priority order. The lower the value, the higher is the priority. If not defined then the resolver is applied with the lowest possible priority.
     */
    order?: number;
    /**
     * Evaluates whether the resolver is applicable to the given `source` and returns the corresponding resolved `resource` if this is the case, `null` otherwise.
     */
    resolve: ResolverFunction<TSource, TResource>;
}

/**
 * Models the master resolver for a given resource.
 * It is constructed using all relevant elementary resolvers.
 * Its {@link Resolver.resolve resolve} function evaluates all resolvers on the given `source` and returns the first non-`null` value.
 */
export class Resolver<TSource, TResource> implements IResolver<TSource, TResource> {
    private ordered = false;
    private get resolvers(): IResolver<TSource, TResource>[] {
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

    constructor(private readonly _resolvers: IResolver<TSource, TResource>[]) {}

    /**
     * Evaluates all resolvers on the given `source` and returns the first non-`null` value.
     *
     * @param source Source to be processed to resolve a resource.
     * @returns Resolved resource associated to the given `source`.
     */
    resolve(source: TSource): Observable<null | TResource> {
        const { resolvers } = this;
        if (resolvers.length) {
            return ContezzaObservables.while<null | TResource>(
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

/**
 * Types how a resolver can be provided, i.e. using either a {@link ResolverFunction}, an {@link IResolver} object or a class extension of {@link Resolver}.
 */
export type ResolverProvider<TResolver extends IResolver<unknown, unknown>> = TResolver['resolve'] | TResolver | Type<TResolver>;

/**
 * Registers the given `resolvers` as providers for the given `token`.
 * A resolver can be provided using either a {@link ResolverFunction}, an {@link IResolver} object or a class extension of {@link Resolver}.
 * This function distinguishes these cases and defines a suitable provider for each case.
 *
 * @param token The token the resolvers are registered as providers for.
 * @param resolvers Resolvers to be provided.
 * @returns Generated list of providers.
 */
export function provideResolvers<TResolver extends IResolver<unknown, unknown>>(token: InjectionToken<TResolver[]>, ...resolvers: ResolverProvider<TResolver>[]): Provider[] {
    return resolvers.map(resolver =>
        typeof resolver === 'function'
            ? 'prototype' in resolver
                ? [
                      resolver,
                      {
                          provide: token,
                          useExisting: resolver,
                          multi: true,
                      },
                  ]
                : {
                      provide: token,
                      useValue: { resolve: resolver },
                      multi: true,
                  }
            : {
                  provide: token,
                  useValue: resolver,
                  multi: true,
              },
    );
}
