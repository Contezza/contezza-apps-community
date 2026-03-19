import { NavigationExtras, PRIMARY_OUTLET, UrlTree } from '@angular/router';

import { Action } from '@ngrx/store';

import { navigate } from '@contezza/common';

import { NavbarItem } from './models';

export class NavbarItemUtils {
    /**
     * Checks whether the given item is active by comparing the url associated to it and the page url.
     *
     * @param item
     * @param routerUrl
     */
    static isActive(item: NavbarItem, routerUrl: string): boolean {
        const url = NavbarItemUtils.resolveUrl(item);
        return url ? !!routerUrl.match(new RegExp('^' + (url.startsWith('/') ? url : '/' + url) + '($|/|[?]|#)', 'g')) : false;
    }

    /**
     * Checks whether a navigation action is defined for the given item.
     *
     * @param item
     */
    static hasNavigationAction(item: NavbarItem): boolean {
        return !!item.url || !!item.click;
    }

    /**
     * Returns the navigation action defined for the given item. Returns `null` if no action is defined.
     *
     * @param item
     * @param parseUrl
     * @param navigationExtras {@link NavigationExtras} of the underlying Router.navigate().
     */
    static getNavigationAction(item: NavbarItem, parseUrl: (url: string) => UrlTree, navigationExtras?: NavigationExtras): (Action & { payload: any }) | null {
        if (item.url) {
            return navigate({ payload: [NavbarItemUtils.getNavigationCommands(parseUrl(item.url)) ?? [item.url], navigationExtras] });
            // this.router.navigate(this.getNavigationCommands(this.item.url));
        } else if (item.click) {
            return {
                type: item.click.action,
                payload: NavbarItemUtils.getNavigationCommands(parseUrl(item.click.payload)) ?? [item.url],
            };
        } else {
            return null;
        }
    }

    /**
     * Returns the "favourite" children of the given item, i.e. the child where a navigation to the given item must redirect to.
     *
     * @param item
     */
    static getNavigationTargetChild(item: NavbarItem): NavbarItem | null {
        if (item.children?.length) {
            return item.children.find((child) => !!child.favourite) ?? item.children[0]!;
        } else {
            return null;
        }
    }

    private static resolveUrl(item: NavbarItem): string | undefined {
        return item.urlMatcher || item.url || item.route;
    }

    private static getNavigationCommands(urlTree: UrlTree): any[] | null {
        const urlSegmentGroup = urlTree.root.children[PRIMARY_OUTLET];

        if (!urlSegmentGroup) {
            return null;
        }

        const urlSegments = urlSegmentGroup.segments;

        return urlSegments.reduce((acc, item) => {
            acc.push(item.path, item.parameters);
            return acc;
        }, [] as any[]);
    }
}
