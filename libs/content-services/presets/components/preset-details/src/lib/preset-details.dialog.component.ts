import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { PresetDetailsComponent } from './preset-details.component';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { DialogTitleComponent } from '@contezza/core/dialogs';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    standalone: true,
    imports: [PresetDetailsComponent, DialogTitleComponent, MatDialogModule, MatButtonModule, TranslateModule],
    selector: 'contezza-search-presets-preset-details-dialog',
    template: ` <div mat-dialog-title>
            <contezza-dialog-title title="CONTENT_SERVICES.PRESETS.DIALOGS.DETAILS_DIALOG.TITLE"></contezza-dialog-title>
        </div>
        <mat-dialog-content>
            <contezza-search-presets-preset-details [presetId]="data.presetId"></contezza-search-presets-preset-details>
        </mat-dialog-content>
        <mat-dialog-actions #actions class="adf-dialog-buttons">
            <span class="adf-fill-remaining-space"></span>
            <button id="cancel" mat-button mat-dialog-close="">
                {{ 'APP.BUTTONS.CANCEL' | translate }}
            </button>
        </mat-dialog-actions>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PresetDetailsDialogComponent {
    constructor(@Inject(MAT_DIALOG_DATA) readonly data: any) {}
}
