import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { provideComponentTranslations } from '@contezza/core/translate';

import { i18n } from './i18n';
import { NavbarGroup, NavbarMode } from './models';
import { ItemGroupComponent } from './components/item-group/item-group.component';

@Component({
    standalone: true,
    imports: [CommonModule, ItemGroupComponent],
    selector: 'contezza-navbar',
    template: `<ng-container *ngFor="let group of groups">
        <contezza-navbar-item-group [group]="group" [mode]="mode" class="contezza-navbar-item-group"></contezza-navbar-item-group>
    </ng-container> `,
    styleUrls: ['./navbar.component.scss'],
    host: { class: 'contezza-navbar' },
    providers: [provideComponentTranslations(i18n)],
})
export class NavbarComponent {
    @Input()
    mode: NavbarMode = NavbarMode.EXPANDED;

    @Input()
    groups: NavbarGroup[] = [];
}
