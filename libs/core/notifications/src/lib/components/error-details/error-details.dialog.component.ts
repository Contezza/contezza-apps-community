import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

import { TranslateModule } from '@ngx-translate/core';

@Component({
    standalone: true,
    imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, TranslateModule],
    selector: 'contezza-error-details-dialog',
    templateUrl: './error-details.dialog.component.html',
    styleUrls: ['./error-details.dialog.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorDetailsDialogComponent {
    constructor(readonly clipboard: Clipboard, @Inject(MAT_DIALOG_DATA) readonly data: any) {}
}
