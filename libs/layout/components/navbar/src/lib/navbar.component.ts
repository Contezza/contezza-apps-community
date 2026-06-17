import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { provideComponentTranslations } from '@contezza/core/translate';

import { ItemGroupComponent } from './components/item-group/item-group.component';
import { i18n } from './i18n';
import { NavbarGroup, NavbarMode } from './models';

@Component({
    standalone: true,
    imports: [ItemGroupComponent],
    selector: 'contezza-navbar',
    template: `@for (group of groups(); track group.id) {
        <contezza-navbar-item-group [group]="group" [mode]="mode()" class="contezza-navbar-item-group" />
    }`,
    styleUrls: ['./navbar.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: 'contezza-navbar' },
    providers: [provideComponentTranslations(i18n)],
})
export class NavbarComponent {
    // inputs
    readonly mode = input<NavbarMode>(NavbarMode.EXPANDED);
    readonly groups = input<NavbarGroup[]>([]);
}
