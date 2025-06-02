import { ChangeDetectionStrategy, Component, Inject, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

import { TranslateModule } from '@ngx-translate/core';

import { PermissionManagerModule } from '@alfresco/adf-content-services';

@Component({
    standalone: true,
    imports: [MatButtonModule, MatDialogModule, MatIconModule, TranslateModule, PermissionManagerModule],
    selector: 'contezza-manage-permissions-dialog',
    template: `<div class="permissions-dialog-actions">
            <span mat-dialog-title>{{ 'CONTENT_SERVICES.ACTIONS.MANAGE_PERMISSIONS' | translate }}</span>
            <span class="adf-fill-remaining-space"></span>
            <button mat-icon-button mat-dialog-close class="permissions-dialog-close-button">
                <mat-icon>close</mat-icon>
            </button>
        </div>
        <mat-dialog-content class="permissions-dialog-content">
            <adf-permission-list [nodeId]="data"></adf-permission-list>
        </mat-dialog-content> `,
    styleUrls: ['manage-permissions.dialog.component.scss'],
    host: { class: 'contezza-manage-permissions-dialog' },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class ManagePermissionsDialogComponent {
    constructor(@Inject(MAT_DIALOG_DATA) readonly data: string) {}
}
