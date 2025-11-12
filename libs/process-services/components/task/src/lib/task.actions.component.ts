import { ChangeDetectionStrategy, Component, computed, EventEmitter, input, Output } from '@angular/core';
import { Task } from '@contezza/process-services/shared';
import { toSignal } from '@angular/core/rxjs-interop';
import { ContentActionRef, ExtensionService, RuleContext } from '@alfresco/adf-extensions';
import { RuleContextService } from '@contezza/core/context';
import { RuleService } from '@contezza/core/extensions';
import { MatButton } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { ContezzaDynamicFormModule, ContezzaDynamicFormService } from '@contezza/dynamic-forms';
import { ContezzaDynamicForm } from '@contezza/dynamic-forms/shared';
import { AsyncPipe } from '@angular/common';
import { ContezzaLetModule } from '@contezza/core/directives';

@Component({
    standalone: true,
    imports: [MatButton, TranslatePipe, MatIconModule, ContezzaDynamicFormModule, AsyncPipe, ContezzaLetModule],
    selector: 'contezza-task-actions',
    template: `
        @if(task().state !== 'COMPLETED'){
        <div class="contezza-task-actions-container">
            <contezza-dynamic-form #form [dynamicForm]="commentForm" />
            <ng-container *contezzaLet="commentForm.value$ | async as value">
                @for (action of actions(); track action.id) {
                <button mat-flat-button color="primary" [id]="action.id" (click)="clicked.emit({ action: action.actions.click, form: value })">
                    <mat-icon [svgIcon]="action.icon" />
                    {{ action.title | translate }}
                </button>
                }
            </ng-container>
        </div>
        }
    `,
    styles: [
        `
            :host {
                width: 100%;
            }
            .contezza-task-actions-container {
                display: flex;
                flex-direction: row;
                gap: 8px;
            }

            contezza-dynamic-form {
                flex: 1;
            }
        `,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskActionsComponent {
    private static readonly ACTION_KEY = 'process-services.actions.task';
    private static readonly COMMENT_FORM_ID = 'process-services.dynamic-forms.comment';

    readonly task = input.required<Task>();

    @Output()
    clicked = new EventEmitter<{ action: string; form: Record<string, any> }>();

    readonly commentForm: ContezzaDynamicForm = this.dfs.get(TaskActionsComponent.COMMENT_FORM_ID).build();

    private readonly ruleContext = toSignal(this.ruleContext$);

    readonly actions = computed<ContentActionRef[]>(() => {
        const context = this.ruleContext();
        const task = this.task();
        const all = this.extensions.getFeature(TaskActionsComponent.ACTION_KEY);
        return all ? this.rules.filterList(all, { ...context, task } as RuleContext) : [];
    });

    constructor(
        private readonly dfs: ContezzaDynamicFormService,
        private readonly rules: RuleService,
        private readonly extensions: ExtensionService,
        private readonly ruleContext$: RuleContextService
    ) {}
}
