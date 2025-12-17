import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

import { TranslatePipe } from '@ngx-translate/core';

import { DialogTitle, DialogTitleComponent } from '@contezza/core/dialogs';

import { ItemDetailsComponent } from './item-details.component';

interface Data<TItem> {
    title: string | DialogTitle;
    id: string;
    item: TItem;
}

@Component({
    standalone: true,
    imports: [MatButtonModule, MatDialogModule, TranslatePipe, DialogTitleComponent, ItemDetailsComponent],
    selector: 'contezza-item-details-dialog',
    template: `<div mat-dialog-title>
            <contezza-dialog-title [title]="data.title" />
        </div>
        <mat-dialog-content><contezza-item-details [id]="data.id" [item]="data.item" /></mat-dialog-content>
        <mat-dialog-actions class="adf-dialog-buttons">
            <span class="adf-fill-remaining-space"></span>
            <button mat-button mat-dialog-close="">{{ 'APP.BUTTONS.CLOSE' | translate }}</button>
        </mat-dialog-actions>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemDetailsDialogComponent<TItem> {
    constructor(@Inject(MAT_DIALOG_DATA) readonly data: Data<TItem>) {}
}
