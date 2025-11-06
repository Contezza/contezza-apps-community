import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ToolbarComponent } from '@contezza/core/context';
import { ItemDetailsComponent } from '@contezza/content-services/components/item-details';

@Component({
    standalone: true,
    imports: [ToolbarComponent, ItemDetailsComponent],
    selector: 'contezza-task-details',
    template: `
        <contezza-toolbar [key]="'process-services.toolbar.task-details'" />
        <contezza-item-details [item]="task.item" id="process-services.property-display-list.task-details" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskDetailsComponent {
    @Input()
    task: any;
}
