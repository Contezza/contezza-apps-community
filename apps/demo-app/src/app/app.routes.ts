import { Route, Routes } from '@angular/router';

import { CONTENT_LAYOUT_ROUTES } from '@alfresco/aca-content';
import { ExtensionsDataLoaderGuard } from '@alfresco/aca-shared';
import { AuthGuard, BlankPageComponent } from '@alfresco/adf-core';

import { PROFILE_ROUTES } from '@contezza/profile';

import { LoginComponent } from './components/login/login.component';

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
        { path: 'dynamic-forms', loadComponent: () => import('./components/demo-dynamic-forms/demo-dynamic-forms.component').then(m => m.DemoDynamicFormsComponent) },
        {
            path: 'search',
            loadChildren: () =>
                import('@contezza/content-services/search/page').then(m => m.MultiSearchTablePageRouterModule.withConfigKeyTemplate('demo-app.search-page-configs.${pageId}')),
        },
        {
            path: 'process-services',
            loadChildren: () => import('@contezza/process-services').then(m => m.ProcessServicesRouterModule),
        },
        {
            path: 'profile',
            children: PROFILE_ROUTES,
        },
        { path: 'javascript-console', loadChildren: () => import('@contezza/js-console').then(m => m.JsConsoleModule) },
        { path: 'node-browser', loadChildren: () => import('@contezza/node-browser').then(m => m.ContezzaNodeBrowserModule) },
        ...CONTENT_LAYOUT_ROUTES.children,
    ],
    canActivateChild: [AuthGuard],
};
