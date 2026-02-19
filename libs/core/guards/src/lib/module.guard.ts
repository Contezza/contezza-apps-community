import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { Store } from '@ngrx/store';

import { filter, map } from 'rxjs';

import { getRepositoryStatus } from '@alfresco/aca-shared/store';

/**
 * Blocks navigation if the given module is not available in the Alfresco environment.
 * Redirects to `elseRedirectTo` if given.
 *
 * @param requiredModule Id of the Alfresco module required to navigate.
 * @param elseRedirectTo Optional route to navigate if not allowed.
 */
export function moduleGuard(requiredModule: string, elseRedirectTo?: string): CanActivateFn {
    return () => {
        // constructor
        const store = inject(Store);
        const router = inject(Router);

        return store.select(getRepositoryStatus).pipe(
            map(r => r.modules),
            filter(Boolean),
            map(modules => {
                const allowed = modules.some(m => m.id === requiredModule);
                return allowed || (elseRedirectTo ? router.parseUrl(elseRedirectTo) : false);
            }),
        );
    };
}
