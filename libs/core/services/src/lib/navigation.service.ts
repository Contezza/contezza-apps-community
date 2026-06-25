import { inject, Injectable, InjectionToken, Provider } from '@angular/core';
import { PRIMARY_OUTLET, Router, UrlSegmentGroup } from '@angular/router';

import { map, Observable } from 'rxjs';

import { IResolver, provideResolvers, Resolver, ResolverProvider } from '@contezza/core/utils';

/**
 * Parameters for Angular's `RouterLink` directive.
 */
export interface RouterLinkParameters {
    /** Router path segments */
    routerLink: string | any[];

    /** Query string parameters */
    queryParams?: Record<string, string | number | boolean | null | undefined>;

    /** URL fragment (without '#') */
    fragment?: string;
}

/**
 * Parameters for HTML's `href` attribute.
 */
export interface HrefParameters {
    href: string;
    target?: '_self' | '_blank' | '_parent' | '_top' | string;
    rel?: string;
}

/**
 * Union type of parameters for either Angular's `RouterLink` directive or HTML's `href` attribute.
 */
export type NavigationParameters = RouterLinkParameters | HrefParameters;

export type ILinkResolver<TItem = unknown> = IResolver<TItem, string>;

const LINK_RESOLVER = new InjectionToken<ILinkResolver[]>('LINK_RESOLVER');

/**
 * Registers the given {@link ILinkResolver}'s in {@link NavigationService}.
 *
 * @param resolvers
 */
export function provideLinkResolvers<TItem = unknown>(...resolvers: ResolverProvider<ILinkResolver<TItem>>[]): Provider[] {
    return provideResolvers(LINK_RESOLVER, ...resolvers);
}

@Injectable({ providedIn: 'root' })
export class NavigationService {
    // constructor
    private readonly router = inject(Router);
    private readonly linkResolver = new Resolver(inject(LINK_RESOLVER, { optional: true }) ?? []);

    /**
     * Resolves and returns the navigation link associated to the given target.
     * These can be used to build an anchor HTML element which navigates to the target.
     *
     * @param target The navigation target.
     * @returns Observable which emits the navigation link associated to the given target, or `null` if no associated link is defined.
     */
    getLink<T>(target: T): Observable<string | null> {
        return this.linkResolver.resolve(target);
    }

    /**
     * Resolves and returns the navigation parameters associated to the given target.
     * These can be used to build an anchor HTML element which navigates to the target.
     *
     * @param target The navigation target.
     * @returns Observable which emits the parameters necessary to build an anchor HTML element which navigates to the target, or `null` if no associated link is defined.
     */
    getParameters<T>(target: T): Observable<NavigationParameters | null> {
        return this.getLink(target).pipe(
            map(link => {
                if (link === null) {
                    return null;
                } else {
                    if (link.startsWith('http')) {
                        return {
                            href: link,
                        };
                    } else {
                        return this.parseRouterLinkParameters(link);
                    }
                }
            }),
        );
    }

    /**
     * Converts a URL string into the equivalent routerLink/queryParams/fragment inputs.
     *
     * @param link URL string.
     * @returns RouterLink/queryParams/fragment inputs.
     */
    private parseRouterLinkParameters(link: string) {
        // Convert a URL string into routerLink/queryParams/fragment inputs.
        const urlTree = this.router.parseUrl(link);

        // Primary outlet contains the normal route path.
        // Named outlets, e.g. /(viewer:...), are stored as children.
        const primaryOutlet = urlTree.root.children[PRIMARY_OUTLET];

        const routerLink: any[] = [];

        // UrlTree does not preserve whether the input was absolute.
        if (link.startsWith('/')) {
            routerLink.push('/');
        }

        if (primaryOutlet) {
            // Convert path segments back into routerLink commands,
            // preserving matrix params if present.
            function segmentCommands(group: UrlSegmentGroup): any[] {
                return group.segments.map(segment => {
                    const matrixParams = segment.parameters;
                    return Object.keys(matrixParams).length ? [segment.path, matrixParams] : segment.path;
                });
            }

            // Convert named outlets into Angular's outlet command syntax.
            function outletCommands(group: UrlSegmentGroup): Record<string, any[]> {
                const outlets: Record<string, any[]> = {};
                for (const [outletName, child] of Object.entries(group.children)) {
                    outlets[outletName] = segmentCommands(child);
                }
                return outlets;
            }

            // Add primary path first, then any named outlets.
            routerLink.push(...segmentCommands(primaryOutlet));

            const outlets = outletCommands(primaryOutlet);

            if (Object.keys(outlets).length > 0) {
                routerLink.push({ outlets });
            }
        }

        return {
            routerLink,
            queryParams: urlTree.queryParams,
            fragment: urlTree.fragment ?? undefined,
        };
    }
}
