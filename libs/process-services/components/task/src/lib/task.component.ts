import { ChangeDetectionStrategy, Component } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { RuleContextService, ToolbarComponent } from '@contezza/core/context';
import { ItemDetailsComponent } from '@contezza/content-services/components/item-details';
import { RefreshSubject, SpinnerOverlayService } from '@contezza/core/services';
import { Task, TaskService } from '@contezza/process-services/shared';
import { combineLatest, debounceTime, map, startWith, switchMap } from 'rxjs';
import { tap } from 'rxjs/operators';
import { TaskActionsComponent } from './task.actions.component';
import { AppStore } from '@alfresco/aca-shared/store';
import { Store } from '@ngrx/store';
import { MatCardModule } from '@angular/material/card';

@Component({
    standalone: true,
    imports: [ToolbarComponent, ItemDetailsComponent, MatCardModule, TaskActionsComponent],
    providers: [],
    selector: 'contezza-task',
    template: `
        @if (task()){
        <mat-card>
            <mat-card-header>
                <mat-card-title>{{ task().title }}</mat-card-title>
                <contezza-toolbar [key]="actionToolbarKey" />
            </mat-card-header>
            <mat-card-content>
                <contezza-item-details [item]="task()" [id]="propertyDisplayListId" />
            </mat-card-content>
            <mat-card-actions align="end">
                <contezza-task-actions [task]="task()" (clicked)="executeTaskAction($event)" />
            </mat-card-actions>
        </mat-card>
        }
    `,
    styles: [
        `
            .mdc-card {
                height: 100vh;
            }

            .mat-mdc-card-content {
                height: 100%;
                overflow: auto;
            }

            ::ng-deep.mat-mdc-card-header-text {
                flex: 1;
                display: flex;
                flex-wrap: wrap;
                align-content: center;
            }
        `,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskComponent {
    private static readonly ACTION_TOOLBAR_KEY = 'process-services.toolbar.task';
    private static readonly PROPERTY_DISPLAY_LIST_ID = 'process-services.property-display-list.task';

    readonly actionToolbarKey = TaskComponent.ACTION_TOOLBAR_KEY;
    readonly propertyDisplayListId = TaskComponent.PROPERTY_DISPLAY_LIST_ID;

    private readonly reload$ = this.refresh$.pipe(startWith(true));
    private readonly taskId$ = this.route.paramMap.pipe(map((params) => params.get('taskId') as string));

    private readonly task$ = combineLatest([this.taskId$, this.reload$]).pipe(
        tap(() => this.spinner.show()),
        debounceTime(500),
        switchMap(([taskId]) => this.taskService.readTask(taskId)),
        tap((task) => this.ruleContext.next({ task })),
        tap(() => this.spinner.hide())
    );
    readonly task = toSignal<Task | null>(this.task$, { initialValue: null });

    constructor(
        private readonly store: Store<AppStore>,
        private readonly route: ActivatedRoute,
        private readonly taskService: TaskService,
        private readonly ruleContext: RuleContextService<{ task: Task }>,
        private readonly refresh$: RefreshSubject,
        private readonly spinner: SpinnerOverlayService
    ) {}

    executeTaskAction({ action, form }): void {
        this.store.dispatch({ type: action, payload: { task: this.task(), comment: form.comment } });
    }
}
