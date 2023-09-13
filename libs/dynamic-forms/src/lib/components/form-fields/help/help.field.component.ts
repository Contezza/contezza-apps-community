import { ChangeDetectionStrategy, Component } from '@angular/core';

import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { TranslateModule } from '@ngx-translate/core';

import { ContezzaBaseFieldComponent } from '../base-field.component';

@Component({
    standalone: true,
    selector: 'contezza-help-field',
    imports: [MatIconModule, MatTooltipModule, TranslateModule],
    template: `<mat-icon class="app-toolbar-button" [matTooltip]="field.label | translate" matTooltipHideDelay="1000" matTooltipPosition="right">help_outline</mat-icon>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HelpFieldComponent extends ContezzaBaseFieldComponent<string> {}
