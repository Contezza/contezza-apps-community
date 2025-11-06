import { NgModule } from '@angular/core';
import { provideExtensionConfig } from '@alfresco/adf-extensions';
import { provideTranslations } from '@alfresco/adf-core';
import { ContentServicesSearchExtensionService } from '@contezza/content-services/search/shared';
import { TaskInstancesService } from '../../shared/src';

@NgModule({
    imports: [],
    providers: [provideTranslations('process-services', 'assets/process-services'), provideExtensionConfig(['process-services.search-table-page-configs.json'])],
})
export class ExtensionModule {
    constructor(private readonly search: ContentServicesSearchExtensionService, private readonly tasks: TaskInstancesService) {
        this.search.setSearchStrategies({
            'process-services.search-strategy.task-instances': ({ parameters, template }) =>
                // get the tasks based on the search parameters
                this.tasks.searchTasks(parameters),
        });
    }
}
