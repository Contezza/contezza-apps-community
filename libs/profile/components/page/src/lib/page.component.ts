import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';

import { TranslatePipe } from '@ngx-translate/core';

import { filter, map } from 'rxjs';

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
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly extensions = inject(ProfileExtensionService);

    readonly tabs: Tab[] = this.extensions.activeTabs;

    private readonly indexToFragment: string[] = this.tabs.map(_ => _.urlFragment);
    private readonly fragmentToIndex: Record<string, number> = Object.fromEntries(this.indexToFragment.map((fragment, index) => [fragment, index]));

    readonly selectedIndex$ = this.route.fragment.pipe(
        map(fragment => {
            if (fragment) {
                const index = this.fragmentToIndex[fragment];
                if (index !== undefined) {
                    return index;
                }
            }
            return null;
        }),
        filter(index => {
            if (index === null) {
                const fragment = this.tabs[0]?.urlFragment;
                if (fragment) {
                    this.router.navigate([], { relativeTo: this.route, fragment, replaceUrl: true });
                }
                return false;
            } else {
                return true;
            }
        }),
    );

    onSelectedTabChange(event: MatTabChangeEvent) {
        this.router.navigate([], { relativeTo: this.route, fragment: this.indexToFragment[event.index] });
    }
}
