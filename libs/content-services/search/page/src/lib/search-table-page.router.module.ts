import { ModuleWithProviders, NgModule, NgModuleFactory } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ChildModuleFactory } from '@contezza/core/utils';

import { SEARCH_TABLE_CONFIG_KEY, SearchTablePageComponent } from '@contezza/content-services/search/components/search-table-layout';

const routes: Routes = [
    { path: '', component: SearchTablePageComponent },
    {
        path: 'view/:nodeId',
        outlet: 'viewer',
        children: [
            {
                path: '',
                loadChildren: () => import('@alfresco/aca-content/viewer').then((m) => m.AcaViewerModule),
            },
        ],
    },
    {
        path: 'view/:nodeId/:versionId',
        outlet: 'viewer',
        children: [
            {
                path: '',
                loadChildren: () => import('@alfresco/aca-content/viewer').then((m) => m.AcaViewerModule),
            },
        ],
    },
];

@NgModule({
    imports: [SearchTablePageComponent, RouterModule.forChild(routes)],
})
export class SearchTablePageRouterModule {
    static withConfig(key: string): ModuleWithProviders<SearchTablePageRouterModule> {
        return {
            ngModule: SearchTablePageRouterModule,
            providers: [{ provide: SEARCH_TABLE_CONFIG_KEY, useValue: key }],
        };
    }

    static asChild(key: string): NgModuleFactory<SearchTablePageRouterModule> {
        return new ChildModuleFactory(SearchTablePageRouterModule.withConfig(key));
    }
}
