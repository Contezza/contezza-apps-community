import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    {
        path: 'tasks',
        children: [
            {
                path: '',
                loadChildren: () =>
                    import('@contezza/content-services/search/page').then((_) => _.SearchTablePageRouterModule.asChild('process-services.search-table-page-config.tasks')),
            },
            {
                path: ':taskId',
                children: [
                    {
                        path: '',
                        loadComponent: () => import('@contezza/process-services/components/task').then((_) => _.TaskComponent),
                    },
                ],
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
})
export class ProcessServicesRouterModule {}
