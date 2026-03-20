import { isObservable, Observable } from 'rxjs';

import { NavBarLinkRef } from '@alfresco/adf-extensions';

import { NAVBAR_CHILDREN, NavbarChildrenFactory, NavbarChildrenRecord } from '@contezza/layout/shared';

export function provideNavbarChildren(components: NavbarChildrenRecord);
export function provideNavbarChildren<T>(components: Record<string, NavbarChildrenFactory<T>>);
export function provideNavbarChildren(components: Record<string, Observable<NavBarLinkRef[]> | NavbarChildrenFactory<any>>);
export function provideNavbarChildren(components: Record<string, Observable<NavBarLinkRef[]> | NavbarChildrenFactory<any>>) {
    return Object.entries(components).map(([key, value]) =>
        isObservable(value)
            ? {
                  provide: NAVBAR_CHILDREN,
                  useValue: { [key]: value },
                  multi: true,
              }
            : {
                  provide: NAVBAR_CHILDREN,
                  useFactory: service => ({ [key]: value.factory(service) }),
                  deps: value.deps,
                  multi: true,
              },
    );
}
