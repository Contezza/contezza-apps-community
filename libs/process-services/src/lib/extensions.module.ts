import { NgModule } from '@angular/core';
import { provideExtensionConfig } from '@alfresco/adf-extensions';
import { provideTranslations } from '@alfresco/adf-core';
import { ContentServicesSearchExtensionService } from '@contezza/content-services/search/shared';
import { TaskInstancesService } from '../../shared/src';
import { EffectsModule } from '@ngrx/effects';
import { Effects } from './store/effects';

@NgModule({
    imports: [EffectsModule.forFeature([Effects])],
    providers: [
        provideTranslations('process-services', 'assets/process-services'),
        provideExtensionConfig([
            'process-services.actions.json',
            'process-services.columns.json',
            'process-services.dashboard.json',
            'process-services.dynamic-form-filters.json',
            'process-services.property-display-lists.json',
            'process-services.search-table-page-configs.json',
        ]),
    ],
})
export class ExtensionModule {
    constructor(private readonly search: ContentServicesSearchExtensionService, private readonly tasks: TaskInstancesService) {
        this.search.setSearchStrategies({
            'process-services.search-strategy.task-instances': ({ parameters }) => this.tasks.searchTasks(parameters),
        });
    }
}

export { ExtensionModule as ProcessServicesExtensionModule };
