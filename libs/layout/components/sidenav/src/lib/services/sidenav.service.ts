import { Injectable } from '@angular/core';

import { Store } from '@ngrx/store';

import { debounceTime, distinctUntilChanged, map, Observable, switchMap } from 'rxjs';

import { AppExtensionService } from '@alfresco/aca-shared';
import { AppStore, getUserProfile } from '@alfresco/aca-shared/store';
import { ContentActionRef, ExtensionService } from '@alfresco/adf-extensions';

import { AdfUtils } from '@contezza/core/utils';
import type { NavbarGroup, NavbarItem } from '@contezza/layout/components/navbar';

import { ContezzaNavbarAdapterService } from './adapter.service';

@Injectable({
    providedIn: 'root',
})
export class SidenavService {
    createActions$ = this.appExtensions.getCreateActions();

    constructor(
        private readonly store: Store<AppStore>,
        private readonly extensions: ExtensionService,
        private readonly appExtensions: AppExtensionService,
        private readonly adapter: ContezzaNavbarAdapterService,
    ) {}

    get navbar$(): Observable<NavbarGroup[]> {
        return this.store.select(getUserProfile).pipe(
            debounceTime(300),
            distinctUntilChanged(),
            map(() => this.appExtensions.navbar),
            switchMap(groups => this.adapter.adapt(groups)),
            map(groups => this.getApplicationNavigation(groups)),
        );
    }

    /**
     * Improves `AppExtensionService.getApplicationNavigation` by including more info from the referred route.
     *
     * @param elements
     */
    getApplicationNavigation(elements: NavbarGroup[]): NavbarGroup[] {
        return (
            elements
                .filter(group => this.filterVisible(group))
                .map(group => {
                    const items = AdfUtils.filterAndSortFeature(group.items || [])
                        .map(item => this.includeRouteRef(item))
                        .filter(item => this.filterVisible(item))
                        .map((item): any => {
                            if (item.children && item.children.length > 0) {
                                item.children = AdfUtils.filterAndSortFeature(item.children || [])
                                    .map(child => this.includeRouteRef(child))
                                    .filter(child => this.filterVisible(child));
                            }
                            return item;
                        });
                    return { ...group, items };
                })
                // filter groups with no items
                .filter(group => group.items.length > 0)
        );
    }

    private includeRouteRef(item: NavbarItem & { click?: any }): NavbarItem {
        const routeRef = this.extensions.getRouteById(item.route);
        const path = routeRef ? routeRef.path : item.route;
        const url = path ? `/${path}` : undefined;
        return {
            ...item,
            url,
            ...(routeRef ? routeRef.data : {}),
            ...(item.click ? { action: item.click } : {}),
        };
    }

    private filterVisible(action: Pick<ContentActionRef, 'rules'>): boolean {
        if (action.rules?.visible) {
            return this.extensions.evaluateRule(action.rules.visible, this.appExtensions);
        }
        return true;
    }
}
