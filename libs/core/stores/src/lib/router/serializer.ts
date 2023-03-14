import { Params, RouterStateSnapshot } from '@angular/router';

import { RouterStateSerializer } from '@ngrx/router-store';

import { ContezzaRouterState } from './state';

export class ContezzaRouterSerializer implements RouterStateSerializer<ContezzaRouterState> {
    serialize(routerState: RouterStateSnapshot): ContezzaRouterState {
        const { url } = routerState;
        const { queryParams } = routerState.root;
        const { fragment } = routerState.root;

        let route = routerState.root;
        const params: Params = {};
        do {
            if (!!route.params) {
                Object.keys(route.params).forEach((key) => {
                    params[key] = route.params[key];
                });
            }
            route = route.firstChild;
        } while (!!route);

        return { url, params, queryParams, fragment };
    }
}
