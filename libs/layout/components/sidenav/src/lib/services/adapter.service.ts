import { Injectable } from '@angular/core';

import { combineLatest, map, Observable, of } from 'rxjs';

import { NavBarGroupRef, NavBarLinkRef } from '@alfresco/adf-extensions';

import { SidenavExtensionService } from '@contezza/layout/shared';

import { ExtendedNavbarItem } from '../models/extended-navbar-item';

@Injectable({
    providedIn: 'root',
})
export class ContezzaNavbarAdapterService {
    constructor(private readonly extensions: SidenavExtensionService) {}

    adapt(groups: (Omit<NavBarGroupRef, 'items'> & { items: (ExtendedNavbarItem | NavBarLinkRef)[] })[]): Observable<NavBarGroupRef[]> {
        return combineLatest(
            groups
                .filter(group => !!group.items)
                .map(group =>
                    combineLatest(group.items.map(item => this.childrenAdapter(item.children).pipe(map(children => ({ ...item, children }))))).pipe(
                        map(items => ({ ...group, items })),
                    ),
                ),
        );
    }

    protected childrenAdapter(children: (ExtendedNavbarItem | NavBarLinkRef)['children']): Observable<NavBarLinkRef['children']> {
        if (children) {
            if (Array.isArray(children)) {
                return of(children);
            } else {
                const navbarChildren = this.extensions.getNavbarChildren(children);
                if (navbarChildren) {
                    return navbarChildren;
                } else {
                    console.error('No navbar children found with id: ' + children);
                    return of([]);
                }
            }
        } else {
            return of(undefined);
        }
    }
}
