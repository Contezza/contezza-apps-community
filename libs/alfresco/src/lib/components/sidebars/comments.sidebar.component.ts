import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

import { NodeCommentsComponent } from '@alfresco/adf-content-services';

import { CurrentFolderStore } from '@contezza/core/context';
import { DetectChangesDirective } from '@contezza/core/directives';

@Component({
    standalone: true,
    imports: [AsyncPipe, MatCardModule, NodeCommentsComponent, DetectChangesDirective],
    selector: 'tezza-alfresco-comments-sidebar',
    template: `@if (node$ | async; as node) {
        <mat-card>
            <adf-node-comments contezza-detect-changes [nodeId]="node.id" [readOnly]="true" />
        </mat-card>
    }`,
    styles: [
        `
            :host {
                padding: 5px;
                width: unset !important;
                height: calc(100% - 10px) !important;
                overflow: auto;
            }
            mat-card {
                padding: 16px;
            }

            /* apply primary color on toolbar button if sidebar is open */
            ::ng-deep contezza-search-table-layout.active-sidebar-alfresco-comments .app-toolbar-button > .mdc-icon-button[id='alfresco.toolbar.toggleSidebarContent.comments'] {
                color: var(--theme-primary-color);
            }
        `,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommentsSidebarComponent {
    // constructor
    private readonly currentFolder = inject(CurrentFolderStore, { optional: true });

    readonly node$ = this.currentFolder?.state$;
}
