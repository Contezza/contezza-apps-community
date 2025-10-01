import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Observable } from 'rxjs';

import { ToolbarComponent as AdfToolbarComponent } from '@alfresco/adf-core';
import { ContentActionRef } from '@alfresco/adf-extensions';
import { ToolbarActionComponent } from '@alfresco/aca-shared';

import { ActionsService } from '../../services';

@Component({
    standalone: true,
    imports: [CommonModule, AdfToolbarComponent, ToolbarActionComponent],
    selector: 'contezza-toolbar',
    template: `<adf-toolbar class="adf-toolbar--inline">
        <ng-container *ngFor="let action of actions$ | async; trackBy: trackById">
            <aca-toolbar-action [actionRef]="action" />
        </ng-container>
    </adf-toolbar>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [ActionsService.provider],
})
export class ToolbarComponent implements OnInit {
    readonly actions$: Observable<ContentActionRef[]> = this.actionsService.actions$;

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
    }

    trackById(_, { id }: ContentActionRef) {
        return id;
    }
}
