import { Injectable } from '@angular/core';

import { map, Observable, of, switchMap } from 'rxjs';

import { ArrayUtils, ContezzaObservables } from '@contezza/core/utils';

import { SharedThumbnailData, ThumbnailConfig, ThumbnailData } from '../models';

type OrObservable<T> = T | Observable<T>;

export interface ThumbnailIconResolver<T = unknown> {
    /**
     * Defines the priority order. The lower the value, the higher is the priority. If not defined then the resolver is applied with the lowest possible priority.
     */
    order?: number;
    /**
     * Evaluates whether the resolver is applicable to the given `item`.
     *
     * @param item
     */
    canApply: (item: T) => OrObservable<boolean>;
    /**
     * Returns the icon (and possibly other thumbnail data) associated to the given `item`.
     *
     * @param item
     */
    getIcon: (item: T) => OrObservable<string | ({ icon: string } & SharedThumbnailData)>;
}

export interface ThumbnailBadgeResolver<T = unknown> {
    /**
     * Unique identifier of the badge resolver.
     * Differently from icon resolvers, badge resolvers are not applied based on a matching function applied to the given `item` but based on a match between this parameter and the `badge` parameter defined in the column settings
     */
    id: string;
    /**
     * Returns the badge (and possibly other thumbnail data) associated to the given `item`.
     * Differently from the icon resolved by a {@link ThumbnailIconResolver}, the badge can be `undefined`.
     *
     * @param item
     */
    getBadge: (item: T) => OrObservable<undefined | string | ({ badge?: string } & SharedThumbnailData)>;
}

/**
 * Defines methods {@link setThumbnailIconResolvers} and {@link setThumbnailBadgeResolvers} which allow to define the logic used to build data for {@link ThumbnailColumnComponent}.
 */
@Injectable({ providedIn: 'root' })
export class ThumbnailService {
    private readonly iconResolvers: ThumbnailIconResolver[] = [];
    private readonly badgeResolvers: ThumbnailBadgeResolver[] = [];

    /**
     * Registers the given {@link ThumbnailIconResolver}'s in the service.
     *
     * @param resolvers
     */
    setThumbnailIconResolvers<T>(...resolvers: ThumbnailIconResolver<T>[]) {
        // if `order` is not defined, then define it to be `MAX_SAFE_INTEGER - 1`
        // so that it is always sorted after all resolvers with a specific order
        // but reserve `MAX_SAFE_INTEGER` for resolvers with the lowest possible priority
        resolvers.forEach((def) => (def.order ??= Number.MAX_SAFE_INTEGER - 1));
        this.iconResolvers.push(...resolvers);
        // re-sort
        ArrayUtils.sortBy(this.iconResolvers, 'order');
        console.log(this.iconResolvers);
    }

    /**
     * Registers the given {@link ThumbnailBadgeResolver}'s in the service.
     *
     * @param resolvers
     */
    setThumbnailBadgeResolvers<T>(...resolvers: ThumbnailBadgeResolver<T>[]) {
        this.badgeResolvers.push(...resolvers);
    }

    /**
     * Returns the data used by {@link ThumbnailColumnComponent} to display a thumbnail.
     *
     * @param item
     * @param config
     */
    getThumbnailData<T>(item: T, config?: ThumbnailConfig): Observable<ThumbnailData | undefined> {
        // search applicable `ThumbnailIconResolver`
        return ContezzaObservables.find(this.iconResolvers, (_) => _.canApply(item)).pipe(
            switchMap((iconDefinition) => {
                if (iconDefinition) {
                    // apply `ThumbnailIconResolver` if found
                    return ContezzaObservables.of(iconDefinition.getIcon(item)).pipe(
                        map((icon) => (typeof icon === 'string' ? { icon } : icon)),
                        switchMap((icon) => {
                            // search `ThumbnailBadgeResolver` if defined in the column settings
                            const badgeResolver = config?.badge ? this.badgeResolvers.find((_) => _.id === config.badge) : undefined;
                            // apply `ThumbnailBadgeResolver` if found
                            const badge$: Observable<{ badge?: string } & SharedThumbnailData> = badgeResolver
                                ? ContezzaObservables.of(badgeResolver.getBadge(item)).pipe(map((badge) => (typeof badge === 'string' ? { badge } : badge)))
                                : of({});
                            // merge icon and badge data
                            return badge$.pipe(
                                map((badge) => ({
                                    ...icon,
                                    ...badge,
                                }))
                            );
                        })
                    );
                } else {
                    return of(undefined);
                }
            })
        );
    }
}
