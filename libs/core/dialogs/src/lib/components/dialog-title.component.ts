import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { TranslateModule } from '@ngx-translate/core';

import { PopoverComponent } from '@contezza/core/popover';

import { DialogTitle } from '../models';

@Component({
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatIconModule, TranslateModule, PopoverComponent],
    selector: 'contezza-dialog-title',
    template: `<div>{{ _title.label | translate : _title.params }}</div>
        <contezza-popover *ngIf="_title.tooltip" [tooltip]="_title.tooltip">
            <button mat-icon-button tabindex="-1"><mat-icon>info</mat-icon></button>
        </contezza-popover>`,
    styles: [
        `
            :host {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            :host mat-icon {
                color: var(--theme-text-color);
            }
        `,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogTitleComponent {
    @Input()
    set title(title: string | DialogTitle) {
        this._title = typeof title === 'string' ? { label: title } : title;
    }

    _title: DialogTitle;
}
