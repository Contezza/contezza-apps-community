import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { TaskDetailsComponent } from './task-details.component';

interface Data {}

@Component({
    standalone: true,
    imports: [MatDialogModule, MatButtonModule, TranslateModule, TaskDetailsComponent],
    selector: 'contezza-task-details-dialog',
    template: `
        <h2 mat-dialog-title>Titel</h2>
        <mat-dialog-content>
            <contezza-task-details />
        </mat-dialog-content>
        <mat-dialog-actions>
            <span class="adf-fill-remaining-space"></span>
            <button mat-button mat-dialog-close="">
                {{ 'APP.BUTTONS.CANCEL' | translate }}
            </button>
        </mat-dialog-actions>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskDetailsDialogComponent {
    constructor(@Inject(MAT_DIALOG_DATA) data: Data) {
        console.log(data);
    }
}
