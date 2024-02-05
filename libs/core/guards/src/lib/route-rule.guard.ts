import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';

import { Store } from '@ngrx/store';

import { filter, map, Observable, take } from 'rxjs';

import { ExtensionService } from '@alfresco/adf-extensions';
import { AppExtensionService } from '@alfresco/aca-shared';
import { AppStore, getUserProfile } from '@alfresco/aca-shared/store';

export const UNAUTHORIZED_ROUTE = new InjectionToken<string>('unauthorized-route');

@Injectable({ providedIn: 'root' })
export class RouteRuleGuard implements CanActivate {
    constructor(
        private readonly router: Router,
        private readonly store: Store<AppStore>,
        private readonly extensions: ExtensionService,
        private readonly appExtensions: AppExtensionService,
        @Inject(UNAUTHORIZED_ROUTE) @Optional() private readonly unauthorizedRoute?: string
    ) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        // get rule from route data
        const rule = route.data?.rules.visible;
        if (rule) {
            // delay rule evaluation until user profile is available
            return this.store.select(getUserProfile).pipe(
                filter((_) => !!_.id),
                take(1),
                // allow navigation if the rule is satisfied
                map(() => this.extensions.evaluateRule(rule, this.appExtensions)),
                // use (if) provided unauthorizedRoute
                map((authorized) => (authorized ? authorized : this.unauthorizedRoute ? this.router.parseUrl(this.unauthorizedRoute) : false))
            );
        }
        // always allow navigation if no rule is defined
        return true;
    }
}
