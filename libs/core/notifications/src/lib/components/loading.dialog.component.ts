import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { TranslateModule } from '@ngx-translate/core';

import { takeUntil } from 'rxjs';

import { DestroyService } from '@contezza/core/services';

import { Notification, NotificationStatus } from '../models';
import { NotificationService } from '../services/notification.service';

@Component({
    standalone: true,
    imports: [CommonModule, MatDialogModule, MatIconModule, MatProgressSpinnerModule, TranslateModule],
    selector: 'contezza-loading-dialog',
    template: `<mat-dialog-content>
        <div>{{ message.label | translate : message.params }}</div>
        <div>
            <ng-container [ngSwitch]="status">
                <ng-container *ngSwitchCase="'progress'">
                    <mat-progress-spinner mode="indeterminate" diameter="20"></mat-progress-spinner>
                </ng-container>
                <ng-container *ngSwitchCase="'complete'">
                    <mat-icon color="primary">check_circle</mat-icon>
                </ng-container>
            </ng-container>
        </div>
    </mat-dialog-content>`,
    styles: [
        `
            mat-dialog-content {
                display: flex;
                align-items: center;
                gap: 8px;
            }
        `,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [DestroyService],
})
export class LoadingDialogComponent {
    readonly message: { label: string; params?: any };
    readonly status: NotificationStatus;

    constructor(
        dialog: MatDialogRef<LoadingDialogComponent>,
        { close$ }: NotificationService,
        destroy$: DestroyService,
        @Inject(MAT_DIALOG_DATA) { message, status }: Notification
    ) {
        this.message = typeof message === 'string' ? { label: message } : message;
        this.status = status;
        close$.pipe(takeUntil(destroy$)).subscribe(() => dialog.close());
    }
}
