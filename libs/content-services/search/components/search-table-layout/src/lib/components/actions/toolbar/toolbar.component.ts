import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Observable } from 'rxjs';

import { ToolbarModule } from '@alfresco/adf-core';
import { ContentActionRef } from '@alfresco/adf-extensions';
import { SharedToolbarModule } from '@alfresco/aca-shared';

import { ActionsService } from '@contezza/core/context';

interface Styled {
    class?: string;
    style?: string;
}

@Component({
    standalone: true,
    imports: [CommonModule, ToolbarModule, SharedToolbarModule],
    selector: 'contezza-toolbar',
    template: `<adf-toolbar class="adf-toolbar--inline">
        <ng-container *ngFor="let action of actions$ | async; trackBy: trackById">
            <aca-toolbar-action [actionRef]="action" [class]="action.class" [style]="action.style"></aca-toolbar-action>
        </ng-container>
    </adf-toolbar>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [ActionsService.provider],
})
export class ToolbarComponent implements OnInit {
    readonly actions$: Observable<(ContentActionRef & Styled)[]> = this.actionsService.actions$;

    @Input()
    key = 'toolbar';

    constructor(private readonly actionsService: ActionsService) {}

    ngOnInit() {
        this.actionsService.featureKey = this.key;
    }

    trackById(_, { id }: ContentActionRef) {
        return id;
    }
}
