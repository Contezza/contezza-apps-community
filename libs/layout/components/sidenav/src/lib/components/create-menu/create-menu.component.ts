/*!
 * @license
 * Alfresco Example Content Application
 *
 * Copyright (C) 2005 - 2020 Alfresco Software Limited
 *
 * This file is part of the Alfresco Example Content Application.
 * If the software was purchased under a paid Alfresco license, the terms of
 * the paid license agreement will prevail.  Otherwise, the software is
 * provided under the following open source license terms:
 *
 * The Alfresco Example Content Application is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * The Alfresco Example Content Application is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Alfresco. If not, see <http://www.gnu.org/licenses/>.
 */

import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, Input, QueryList, ViewChild, ViewChildren, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuModule, MatMenuTrigger } from '@angular/material/menu';

import { TranslateModule } from '@ngx-translate/core';

import { SharedToolbarModule, ToolbarMenuItemComponent } from '@alfresco/aca-shared';
import { ContentActionRef } from '@alfresco/adf-extensions';

import { SidenavMode } from '../../models/sidenav-mode';

@Component({
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatIconModule, MatMenuModule, TranslateModule, SharedToolbarModule],
    selector: 'contezza-create-menu',
    templateUrl: './create-menu.component.html',
    styleUrls: ['./create-menu.component.scss'],
    encapsulation: ViewEncapsulation.None,
    host: { class: 'contezza-create-menu' },
})
export class CreateMenuComponent implements AfterViewInit {
    @Input()
    actions!: Array<ContentActionRef>;

    @Input()
    mode: SidenavMode = SidenavMode.EXPANDED;

    @ViewChild(MatMenuTrigger) trigger!: MatMenuTrigger;

    @ViewChild(MatMenu)
    menu: MatMenu;

    @ViewChildren(ToolbarMenuItemComponent)
    toolbarMenuItems: QueryList<ToolbarMenuItemComponent>;

    ngAfterViewInit(): void {
        const menuItems = [];
        this.toolbarMenuItems.forEach((toolbarMenuItem) => {
            if (toolbarMenuItem.menuItem !== undefined) {
                menuItems.push(toolbarMenuItem.menuItem);
            }
        });
        const menuItemsQueryList: QueryList<MatMenuItem> = new QueryList<MatMenuItem>();
        menuItemsQueryList.reset(menuItems);
        this.menu._allItems = menuItemsQueryList;
        this.menu.ngAfterContentInit();
    }
    trackByActionId(_: number, obj: ContentActionRef): string {
        return obj.id;
    }
}
