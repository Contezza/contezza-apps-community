import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommentsDialogData } from './comments';
import { MatButtonModule } from '@angular/material/button';
import { NodeCommentsComponent } from '@alfresco/adf-content-services';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

@Component({
    standalone: true,
    imports: [MatButtonModule, CommonModule, MatDialogModule, NodeCommentsComponent, TranslateModule],
    selector: 'contezza-comments-dialog',
    template: `<mat-dialog-content>
            <adf-node-comments *ngIf="nodeId" [nodeId]="nodeId" />
        </mat-dialog-content>
        <mat-dialog-actions>
            <button mat-button mat-dialog-close>
                {{ 'APP.DIALOGS.BUTTONS.CLOSE' | translate }}
            </button>
        </mat-dialog-actions>`,
    changeDetection: ChangeDetectionStrategy.Default,
})
export class CommentsDialogComponent {
    get nodeId(): string | null {
        return this.data?.nodeId ?? null;
    }

    constructor(@Inject(MAT_DIALOG_DATA) readonly data: CommentsDialogData) {}
}
