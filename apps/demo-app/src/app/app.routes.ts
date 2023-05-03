import { Routes } from '@angular/router';

import { BlankPageComponent } from '@alfresco/adf-core';
import { CONTENT_LAYOUT_ROUTES } from '@alfresco/aca-content';

import { LoginComponent } from './components/login/login.component';

export const APP_ROUTES: Routes = [
    { path: 'blank', component: BlankPageComponent },
    { path: 'login', component: LoginComponent, data: { title: 'APP.SIGN_IN' } },
];

const APP_LAYOUT_ROUTES: Routes = [
    { path: 'dynamic-forms-demo-shell', loadComponent: () => import('./components/dynamic-forms-demo-shell/demo-shell.component').then((m) => m.DemoShellComponent) },
    { path: 'javascript-console', loadChildren: () => import('@contezza/js-console').then((m) => m.ContezzaJsConsoleModule) },
    { path: 'node-browser', loadChildren: () => import('@contezza/node-browser').then((m) => m.ContezzaNodeBrowserModule) },
];

export const shellChildren = () => {
    const children = CONTENT_LAYOUT_ROUTES.children;

    APP_LAYOUT_ROUTES.map((route) => children.unshift(route));

    return { ...CONTENT_LAYOUT_ROUTES, children };
};
