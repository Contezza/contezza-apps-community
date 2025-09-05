import { Injectable } from '@angular/core';

import { map, Observable, of, switchMap } from 'rxjs';

import { RuleContext } from '@alfresco/adf-extensions';

import { Translate } from '@contezza/core/translate';
import { ArrayUtils, ContezzaObservables } from '@contezza/core/utils';

import { SharedThumbnailData, ThumbnailConfig, ThumbnailData } from '../models';

type OrObservable<T> = T | Observable<T>;

export interface ThumbnailResolver<TItem = unknown, TConfig extends ThumbnailConfig = ThumbnailConfig, TContext extends RuleContext = RuleContext> {
    /**
     * Defines the priority order. The lower the value, the higher is the priority. If not defined then the resolver is applied with the lowest possible priority.
     */
    order?: number;
    /**
     * Evaluates whether the resolver is applicable to the given `item` and returns the corresponding icon or badge (and possibly other thumbnail data, such as tooltip and style) if this is the case.
     * It returns `null` otherwise.
     * Custom column configuration and rule context are also supported as (optional) evaluation parameters.
     *
     * @param item
     * @param config
     * @param context
     */
    apply: (item: TItem, config?: TConfig, context?: TContext) => OrObservable<null | string | ({ value: string } & SharedThumbnailData)>;
}

type ResolverType = 'badge' | 'icon';

/**
 * Defines methods {@link setThumbnailIconResolvers} and {@link setThumbnailBadgeResolvers} which allow to define the logic used to build data for {@link ThumbnailColumnComponent}.
 */
@Injectable({ providedIn: 'root' })
export class ThumbnailService {
    private readonly iconResolvers: ThumbnailResolver[] = [];
    private readonly badgeResolvers: ThumbnailResolver[] = [];

    constructor(private readonly translate: Translate) {}

    /**
     * Registers the given {@link ThumbnailResolver}'s as icon resolvers in the service.
     *
     * @param resolvers
     */
    setThumbnailIconResolvers<TItem = unknown, TConfig extends ThumbnailConfig = ThumbnailConfig, TContext extends RuleContext = RuleContext>(
        ...resolvers: ThumbnailResolver<TItem, TConfig, TContext>[]
    ) {
        this.setResolvers('icon', ...resolvers);
    }

    /**
     * Registers the given {@link ThumbnailResolver}'s as badge resolvers in the service.
     *
     * @param resolvers
     */
    setThumbnailBadgeResolvers<TItem = unknown, TConfig extends ThumbnailConfig = ThumbnailConfig, TContext extends RuleContext = RuleContext>(
        ...resolvers: ThumbnailResolver<TItem, TConfig, TContext>[]
    ) {
        this.setResolvers('badge', ...resolvers);
    }

    /**
     * Returns the data used by {@link ThumbnailColumnComponent} to display a thumbnail.
     *
     * @param item
     * @param config
     * @param context
     */
    getThumbnailData<TItem, TConfig extends ThumbnailConfig, TContext extends RuleContext>(item: TItem, config?: TConfig, context?: TContext): Observable<ThumbnailData | null> {
        // search applicable icon resolver
        return this.resolve('icon', item, config, context).pipe(
            switchMap((icon) => {
                if (icon) {
                    // search applicable badge resolver
                    return this.resolve('badge', item, config, context).pipe(
                        map((badge) => {
                            const { value: iconValue, tooltip: iconTooltip, ...iconRest } = icon;
                            const { value: badgeValue, tooltip: badgeTooltip, ...badgeRest } = badge || {};
                            return {
                                icon: iconValue,
                                badge: badgeValue,
                                // if both icon and badge have a tooltip, combine them
                                tooltip: [badgeTooltip, iconTooltip]
                                    .filter(Boolean)
                                    .map((t) => this.translate(t))
                                    .join('\n\n'),
                                // TODO: improve merge logic, now badge style always overwrite icon style
                                ...iconRest,
                                ...badgeRest,
                            };
                        })
                    );
                } else {
                    return of(null);
                }
            })
        );
    }

    private getResolvers(type: ResolverType) {
        switch (type) {
            case 'badge':
                return this.badgeResolvers;
            case 'icon':
                return this.iconResolvers;
        }
    }

    private setResolvers(type: ResolverType, ...resolvers: ThumbnailResolver[]) {
        const targetResolvers = this.getResolvers(type);
        // if `order` is not defined, then define it to be `MAX_SAFE_INTEGER - 1`
        // so that it is always sorted after all resolvers with a specific order
        // but reserve `MAX_SAFE_INTEGER` for resolvers with the lowest possible priority
        resolvers.forEach((def) => (def.order ??= Number.MAX_SAFE_INTEGER - 1));
        targetResolvers.push(...resolvers);
        // re-sort
        ArrayUtils.sortBy(targetResolvers, 'order');
    }

    private resolve<TItem, TConfig extends ThumbnailConfig, TContext extends RuleContext>(
        type: ResolverType,
        item: TItem,
        config?: TConfig,
        context?: TContext
    ): Observable<null | ({ value: string } & SharedThumbnailData)> {
        const resolvers = this.getResolvers(type);
        if (resolvers.length) {
            return ContezzaObservables.while<null | string | ({ value: string } & SharedThumbnailData)>(
                (response, i) => response === null && i < resolvers.length,
                (_, i) => {
                    const resolver = resolvers[i]!;
                    return ContezzaObservables.of(resolver.apply(item, config, context)).pipe(map((value) => value ?? null));
                }
            ).pipe(map((value) => (typeof value === 'string' ? { value } : value)));
        } else {
            return of(null);
        }
    }
}
