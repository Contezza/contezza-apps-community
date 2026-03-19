import { Routes } from '@angular/router';

export const ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('@contezza/profile/components/page').then(m => m.PageComponent),
    },
];

export { ROUTES as PROFILE_ROUTES };
