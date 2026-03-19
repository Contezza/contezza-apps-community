import { inject, Injectable, InjectionToken, Type } from '@angular/core';

import { Observable } from 'rxjs';

import { NavBarLinkRef } from '@alfresco/adf-extensions';

export type NavbarChildrenFactory<T> = {
    factory: (x: T) => Observable<NavBarLinkRef[]>;
    deps: [Type<T>];
};
export type NavbarChildrenRecord = Record<string, Observable<NavBarLinkRef[]>>;
export const NAVBAR_CHILDREN = new InjectionToken<NavbarChildrenRecord[]>('NAVBAR_CHILDREN');

@Injectable({
    providedIn: 'root',
})
export class SidenavExtensionService {
    // constructor
    private readonly _ncrs? = inject<NavbarChildrenRecord[]>(NAVBAR_CHILDREN, { optional: true });

    private readonly navbarChildren = new Map<string, Observable<NavBarLinkRef[]>>();

    constructor() {
        this._ncrs?.forEach(list => this.setNavbarChildren(list));
    }

    getNavbarChildren(id: string): Observable<NavBarLinkRef[]> {
        return this.navbarChildren.get(id);
    }

    setNavbarChildren(values: Record<string, Observable<NavBarLinkRef[]>>) {
        if (values) {
            Object.entries(values).forEach(([key, value]) => this.navbarChildren.set(key, value));
        }
    }
}
