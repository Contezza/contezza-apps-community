import { Component, input } from '@angular/core';

import { DynamicExtensionComponent } from '@alfresco/adf-extensions';

import { NavbarGroup, NavbarMode } from '../../models';
import { ItemWithChildrenComponent } from '../item-with-children/item-with-children.component';
import { SimpleItemComponent } from '../simple-item/simple-item.component';

@Component({
    standalone: true,
    imports: [DynamicExtensionComponent, SimpleItemComponent, ItemWithChildrenComponent],
    selector: 'contezza-navbar-item-group',
    template: `@for (item of group().items; track item.id) {
        @if (!item.component) {
            @if (!!item.children) {
                <contezza-navbar-item-with-children [item]="item" [mode]="mode()" />
            } @else {
                <contezza-navbar-simple-item [item]="item" [mode]="mode()" />
            }
        } @else {
            <adf-dynamic-component [data]="{ item: item, state: mode() }" [id]="item.component!" />
        }
    }`,
    styles: [
        `
            :host {
                display: flex;
                flex-direction: column;
                gap: 2px;
            }
        `,
    ],
    host: { class: 'contezza-navbar-item-group' },
})
export class ItemGroupComponent {
    // inputs
    readonly group = input.required<NavbarGroup>();
    readonly mode = input<NavbarMode>(NavbarMode.EXPANDED);
}
