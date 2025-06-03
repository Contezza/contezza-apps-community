import { Route, Routes } from '@angular/router';

import { AuthGuard, BlankPageComponent, LoginComponent } from '@alfresco/adf-core';
import { ExtensionsDataLoaderGuard } from '@alfresco/aca-shared';
import { CONTENT_LAYOUT_ROUTES } from '@alfresco/aca-content';

export const APP_ROUTES: Routes = [
    { path: 'blank', component: BlankPageComponent },
    { path: 'login', component: LoginComponent, data: { title: 'APP.SIGN_IN' } },
];

export const APP_LAYOUT_ROUTES: Route = {
    path: '',
    canActivate: [ExtensionsDataLoaderGuard],
    children: [
        {
            path: '',
            redirectTo: `/dynamic-forms`,
            pathMatch: 'full',
        },
        { path: 'dynamic-forms', loadComponent: () => import('./components/dynamic-forms-demo-shell/demo-shell.component').then((m) => m.DemoShellComponent) },
        // { path: Config.Urls.JsConsole, loadChildren: () => import('@contezza/js-console').then((m) => m.JsConsoleModule) },
        { path: 'node-browser', loadChildren: () => import('@contezza/node-browser').then((m) => m.ContezzaNodeBrowserModule) },
        {
            path: 'search-favorites',
            loadChildren: () => import('@contezza/content-services/search/page').then((m) => m.SearchTablePageRouterModule.asChild('favorites-config')),
        },
        {
            path: 'search',
            loadChildren: () =>
                import('@contezza/content-services/search/page').then((m) => m.MultiSearchTablePageRouterModule.withConfigKeyTemplate('search.search-page-configs.${pageId}')),
        },
        ...CONTENT_LAYOUT_ROUTES.children,
    ],
    canActivateChild: [AuthGuard],
};
