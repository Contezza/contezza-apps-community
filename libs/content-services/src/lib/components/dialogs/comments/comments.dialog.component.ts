import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommentsDialogData } from './comments';
import { MatButtonModule } from '@angular/material/button';
import { NodeCommentsComponent } from '@alfresco/adf-content-services';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    standalone: true,
    imports: [MatButtonModule, MatDialogModule, NodeCommentsComponent, TranslateModule],
    selector: 'contezza-comments-dialog',
    template: `<mat-dialog-content>
            <adf-node-comments class="comment-container" [nodeId]="nodeId" />
        </mat-dialog-content>
        <mat-dialog-actions>
            <button mat-button mat-dialog-close>
                {{ 'APP.DIALOGS.BUTTONS.CLOSE' | translate }}
            </button>
        </mat-dialog-actions>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommentsDialogComponent {
    get nodeId(): string {
        return this.data?.nodeId ?? '';
    }
    constructor(@Inject(MAT_DIALOG_DATA) readonly data: CommentsDialogData) {}
}
