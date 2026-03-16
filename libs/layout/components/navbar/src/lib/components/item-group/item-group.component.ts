import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslateModule } from '@ngx-translate/core';

import { ExtensionsModule } from '@alfresco/adf-extensions';

import { NavbarGroup, NavbarItem, NavbarMode } from '../../models';
import { ItemWithChildrenComponent } from '../item-with-children/item-with-children.component';
import { SimpleItemComponent } from '../simple-item/simple-item.component';

@Component({
    standalone: true,
    imports: [CommonModule, TranslateModule, ExtensionsModule, SimpleItemComponent, ItemWithChildrenComponent],
    selector: 'contezza-navbar-item-group',
    template: `<ng-container *ngFor="let item of group.items; trackBy: trackById">
        <ng-container *ngIf="!item.component; else dynamicComponent">
            <ng-container *ngIf="!!item.children; else simpleItem">
                <ng-template [ngTemplateOutlet]="itemWithChildren"></ng-template>
            </ng-container>
        </ng-container>
        <ng-template #dynamicComponent>
            <adf-dynamic-component [data]="{ item: item, state: mode }" [id]="item.component!"></adf-dynamic-component>
        </ng-template>
        <ng-template #simpleItem>
            <contezza-navbar-simple-item [item]="item" [mode]="mode"></contezza-navbar-simple-item>
        </ng-template>
        <ng-template #itemWithChildren>
            <contezza-navbar-item-with-children [item]="item" [mode]="mode"></contezza-navbar-item-with-children>
        </ng-template>
    </ng-container>`,
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
    @Input()
    group!: NavbarGroup;

    @Input()
    mode: NavbarMode = NavbarMode.EXPANDED;

    trackById(_index: number, obj: NavbarItem) {
        return obj.id;
    }
}
