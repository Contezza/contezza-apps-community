import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { TranslatePipe } from '@ngx-translate/core';

import { IconDirective } from '@contezza/core/directives';

import { ItemComponent } from '../item.component';

@Component({
    standalone: true,
    imports: [MatButtonModule, MatIconModule, TranslatePipe, IconDirective],
    selector: 'contezza-navbar-simple-item',
    templateUrl: './simple-item.component.html',
    styleUrls: ['./simple-item.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: 'contezza-navbar-simple-item' },
})
export class SimpleItemComponent extends ItemComponent {
    onClick() {
        this.navigateTo(this.item());
    }

    protected get active(): boolean {
        return this.isActive(this.item());
    }
}
