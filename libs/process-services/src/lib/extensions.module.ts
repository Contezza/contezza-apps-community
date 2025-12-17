import { NgModule } from '@angular/core';
import { ExtensionService, provideExtensionConfig, RuleContext } from '@alfresco/adf-extensions';
import { provideTranslations } from '@alfresco/adf-core';
import { ContentServicesSearchExtensionService } from '@contezza/content-services/search/shared';
import { Task, TaskService } from '@contezza/process-services/shared';
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
            'process-services.dynamic-forms.json',
            'process-services.icons.json',
            'process-services.property-display-lists.json',
            'process-services.search-table-page-configs.json',
        ]),
    ],
})
export class ExtensionModule {
    constructor(private readonly search: ContentServicesSearchExtensionService, private readonly extensions: ExtensionService, private readonly tasks: TaskService) {
        this.search.setSearchStrategies({
            'process-services.search-strategy.tasks': ({ parameters }) => this.tasks.readTasks(parameters),
        });

        const isCompleted = (task: Task | null | undefined): boolean => !!task && task.state === 'COMPLETED';
        const canClaim = (task: Task | null | undefined): boolean => !!task && !isCompleted(task) && task.owner === null;
        const canRelease = (task: Task | null | undefined): boolean => !!task && !isCompleted(task) && task.owner !== null;
        const completableNames = new Set(['adhocTask', 'verifyTaskDone', 'approved', 'rejected']);
        const canComplete = (task: Task | null | undefined): boolean =>
            !!task && !isCompleted(task) && !!task.definition?.node?.name && completableNames.has(task.definition.node.name);
        const canReviewTask = (task: Task | null | undefined): boolean => !!task && !isCompleted(task) && task.definition?.node?.name === 'reviewTask';

        this.extensions.setEvaluators({
            'process-services.rules.canSave': (context: RuleContext & { task: Task }) => !isCompleted(context.task),
            'process-services.rules.canClaim': (context: RuleContext & { task: Task }) => canClaim(context.task),
            'process-services.rules.canRelease': (context: RuleContext & { task: Task }) => canRelease(context.task),
            'process-services.rules.canComplete': (context: RuleContext & { task: Task }) => canComplete(context.task),
            'process-services.rules.canReview': (context: RuleContext & { task: Task }) => canReviewTask(context.task),
        });
    }
}

export { ExtensionModule as ProcessServicesExtensionModule };
