import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

import { Observable } from 'rxjs';

import { ToolbarActionComponent } from '@alfresco/aca-shared';
import { ToolbarComponent as AdfToolbarComponent } from '@alfresco/adf-core';
import { ContentActionRef } from '@alfresco/adf-extensions';

import { Stylable } from '@contezza/core/utils';

import { ActionsService, ActionTrigger } from '../../services';

@Component({
    standalone: true,
    imports: [CommonModule, AdfToolbarComponent, ToolbarActionComponent],
    selector: 'contezza-toolbar',
    template: `<adf-toolbar class="adf-toolbar--inline">
        <ng-container *ngFor="let action of actions$ | async; trackBy: trackById">
            <aca-toolbar-action [actionRef]="action" [class]="action.class" [style]="action.style" />
        </ng-container>
    </adf-toolbar>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [ActionsService.provider],
})
export class ToolbarComponent implements OnInit {
    readonly actions$: Observable<(ContentActionRef & Stylable)[]> = this.actionsService.actions$;

    @Input()
    key = 'toolbar';

    @Input()
    actions?: ContentActionRef[];

    constructor(private readonly actionsService: ActionsService) {}

    ngOnInit() {
        if (this.actions) {
            this.actionsService.actions = this.actions;
        } else {
            this.actionsService.featureKey = this.key;
        }
        this.actionsService.trigger = ActionTrigger.TOOLBAR;
    }

    trackById(_, action: ContentActionRef) {
        if (action.type !== 'menu') {
            return action.id;
        } else {
            // forceren om te zorgen dat de menu-items worden herladen voor toetsenbordtoegankelijkheid
            return action.id + action.children.length;
        }
    }
}
