import { Injectable, Type } from '@angular/core';
import { LoadChildren, Route } from '@angular/router';

import { RouteRef } from '@alfresco/adf-extensions';
import { ExtensionRoute as AcaExtensionRoute, RouterExtensionService as AcaRouterExtensionService } from '@alfresco/aca-shared';

import { ContezzaAdfUtils } from '@contezza/core/utils';

/**
 * Extends `@alfresco/adf-extensions/RouteRef` allowing to define the route using `loadChildren` or `loadComponent`.
 */
export type ExtensionRoute = Omit<RouteRef, 'component'> & ({ component: string } | { loadChildren: string } | { loadComponent: string });

/**
 * Extends `@alfresco/aca-shared/RouterExtensionService` with the following features:
 * * Parameter `disabled` can be used to disable extension routes.
 * * Besides `component`, parameters `loadChildren` and `loadComponent` can also be used to define an extension route; the corresponding resolver must be defined using method `setLoadChildren` or `setLoadComponent` respectively; this resolver must implement the same interface as the corresponding property of `@angular/router/Route`.
 */
@Injectable({ providedIn: 'root' })
export class RouterExtensionService extends AcaRouterExtensionService {
    static readonly provider = { provide: AcaRouterExtensionService, useExisting: RouterExtensionService };

    private readonly loadChildrenRegistry: Record<string, LoadChildren> = {};
    private readonly loadComponentRegistry: Record<string, Route['loadComponent']> = {};

    setLoadChildren(values: RouterExtensionService['loadChildrenRegistry']) {
        if (values) {
            Object.assign(this.loadChildrenRegistry, values);
        }
    }

    private getLoadChildren(id: string): RouterExtensionService['loadChildrenRegistry']['string'] {
        const loadChildren = this.loadChildrenRegistry[id];
        if (!loadChildren) {
            throw new Error('Undefined loadChildren: ' + id);
        }
        return loadChildren;
    }

    setLoadComponent(values: RouterExtensionService['loadComponentRegistry']) {
        if (values) {
            Object.assign(this.loadChildrenRegistry, values);
        }
    }

    private getLoadComponent(id: string): RouterExtensionService['loadComponentRegistry']['string'] {
        const loadComponent = this.loadComponentRegistry[id];
        if (!loadComponent) {
            throw new Error('Undefined loadComponent: ' + id);
        }
        return loadComponent;
    }

    getApplicationRoutes(): AcaExtensionRoute[] {
        // filter disabled routes
        const routes: ExtensionRoute[] = ContezzaAdfUtils.filterAndSortFeature(this.extensions.routes);
        return routes.map((route) => {
            const guards = this.extensions.getAuthGuards(route.auth && route.auth.length > 0 ? route.auth : this.defaults.auth);

            return {
                path: route.path,
                component: (this as any).getComponentById(route.layout ?? this.defaults.layout),
                canActivateChild: guards,
                canActivate: guards,
                // default parentRoute = ''
                parentRoute: route.parentRoute ?? '',
                children: [
                    ...(route['children']
                        ? route['children'].map((child) => ({
                              path: child.path,
                              outlet: child.outlet,
                              data: child.data,
                              // extend route resolution
                              ...this.getRouteComponent(child),
                          }))
                        : []),
                    {
                        path: '',
                        // extend route resolution
                        ...this.getRouteComponent(route),
                        data: route.data,
                    },
                ],
            };
        });
    }

    private getRouteComponent(route: { component: RouteRef['component'] }): { component: Type<unknown> };
    private getRouteComponent(route: { loadChildren: string }): { loadChildren: LoadChildren };
    private getRouteComponent(route: { loadComponent: string }): { loadComponent: Route['loadComponent'] };
    private getRouteComponent(
        route: { component: RouteRef['component'] } | { loadChildren: string } | { loadComponent: string }
    ): { component: Type<unknown> } | { loadChildren: LoadChildren } | { loadComponent: Route['loadComponent'] };
    private getRouteComponent(
        route: { component: RouteRef['component'] } | { loadChildren: string } | { loadComponent: string }
    ): { component: Type<unknown> } | { loadChildren: LoadChildren } | { loadComponent: Route['loadComponent'] } {
        if ('component' in route) {
            return { component: (this as any).getComponentById(route.component) };
        } else if ('loadChildren' in route) {
            return { loadChildren: this.getLoadChildren(route.loadChildren) };
        } else {
            return { loadComponent: this.getLoadComponent(route.loadComponent) };
        }
    }
}
