import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';

import { TranslatePipe } from '@ngx-translate/core';

import { ContezzaLetDirective } from '@contezza/core/directives';
import { ProfileExtensionService, Tab } from '@contezza/profile/shared';

import { TabComponent } from './tab.component';

@Component({
    standalone: true,
    imports: [CommonModule, MatTabsModule, TabComponent, MatIcon, MatButtonModule, TranslatePipe, ContezzaLetDirective],
    selector: 'contezza-profile-page',
    templateUrl: 'page.component.html',
    styleUrls: ['page.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageComponent {
    // constructor
    private readonly extensions = inject(ProfileExtensionService);

    readonly tabs: Tab[] = this.extensions.activeTabs;

    onSelectedTabChange(event: MatTabChangeEvent) {
        // TODO
        console.log(event);
    }
}
