import { ChangeDetectionStrategy, Component, inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { DialogData } from '../models';
import { DialogActionComponent } from './dialog-action.component';
import { DialogContentComponent } from './dialog-content.component';
import { DialogTitleComponent } from './dialog-title.component';

@Component({
    standalone: true,
    imports: [MatDialogModule, DialogTitleComponent, DialogContentComponent, DialogActionComponent],
    selector: 'contezza-dialog',
    template: `@if (data.title) {
            <div mat-dialog-title>
                <contezza-dialog-title [title]="data.title" />
            </div>
        }
        @if (data.content) {
            <mat-dialog-content><contezza-dialog-content [content]="data.content" /></mat-dialog-content>
        }
        @if (data.actions?.length) {
            <mat-dialog-actions class="contezza-dialog-actions">
                @for (action of data.actions; track action.id) {
                    <contezza-dialog-action [dialog]="this" [action]="action" />
                }
            </mat-dialog-actions>
        }`,
    styles: [
        `
            .contezza-dialog-actions {
                justify-content: flex-end;
                gap: 8px;
            }
        `,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogComponent {
    // constructor
    readonly dialogRef = inject<MatDialogRef<DialogComponent>>(MatDialogRef);
    readonly data = inject<DialogData>(MAT_DIALOG_DATA);

    @ViewChild(DialogContentComponent)
    content?: DialogContentComponent;

    get contentComponent() {
        return this.content?.component;
    }
}
