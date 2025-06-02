import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { ColumnComponent } from '@contezza/content-services/shared';

@Component({
    standalone: true,
    imports: [MatButtonModule, MatIconModule],
    selector: 'contezza-context-menu-column',
    template: `<button mat-icon-button #button (click)="onClick(button._elementRef.nativeElement); $event.stopPropagation()"><mat-icon>more_vert</mat-icon></button>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContextMenuColumnComponent extends ColumnComponent {
    onClick(button: HTMLElement) {
        button.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }));
    }
}
