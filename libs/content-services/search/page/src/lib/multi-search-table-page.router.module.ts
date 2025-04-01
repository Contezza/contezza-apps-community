import { ModuleWithProviders, NgModule, NgModuleFactory, Optional, SkipSelf } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ChildModuleFactory } from '@contezza/core/utils';

import { SEARCH_TABLE_CONFIG_KEY_TEMPLATE, SearchTablePageService } from '@contezza/content-services/search/components/search-table-layout';

const routes: Routes = [
    {
        path: ':pageId',
        loadChildren: () => import('./search-table-page.router.module').then((m) => m.SearchTablePageRouterModule),
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    providers: [
        // provide default if not provided
        {
            provide: SEARCH_TABLE_CONFIG_KEY_TEMPLATE,
            useFactory: (existing?: string) => existing ?? '${pageId}-config',
            deps: [[new Optional(), new SkipSelf(), SEARCH_TABLE_CONFIG_KEY_TEMPLATE]],
        },
    ],
})
export class MultiSearchTablePageRouterModule {
    private static _withConfigKeyTemplate(key: string): ModuleWithProviders<MultiSearchTablePageRouterModule> {
        return {
            ngModule: MultiSearchTablePageRouterModule,
            providers: [SearchTablePageService.provideConfigKeyTemplate(key)],
        };
    }

    static withConfigKeyTemplate(key: string): NgModuleFactory<MultiSearchTablePageRouterModule> {
        return new ChildModuleFactory(MultiSearchTablePageRouterModule._withConfigKeyTemplate(key));
    }
}
