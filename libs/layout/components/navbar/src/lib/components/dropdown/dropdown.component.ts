import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, inject, input, Output, ViewChild } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { Router } from '@angular/router';

import { TranslatePipe } from '@ngx-translate/core';

import { Store } from '@ngrx/store';

import { IconDirective } from '@contezza/core/directives';

import { NavbarItem } from '../../models';
import { NavbarItemUtils } from '../../utils';

@Component({
    standalone: true,
    imports: [MatMenuModule, IconDirective, MatIcon, MatIconButton, TranslatePipe],
    selector: 'contezza-navbar-dropdown',
    template: `<button
            #visibleTrigger
            mat-icon-button
            [id]="item().id"
            [attr.aria-label]="item().title | translate"
            [attr.data-automation-id]="item().id"
            [attr.title]="item().description || '' | translate"
            (focus)="menuTrigger.openMenu()"
            (click)="onTitleClick()"
        >
            @if (item().icon) {
                <mat-icon [contezzaIcon]="item().icon" />
            }
        </button>
        <!--        use fake-menu-trigger to position the menu-->
        <div #menuTrigger="matMenuTrigger" class="fake-menu-trigger" [matMenuTriggerFor]="menu" [matMenuTriggerRestoreFocus]="false"></div>
        <mat-menu #menu="matMenu" [hasBackdrop]="false" (closed)="visibleTrigger.focus()">
            @for (child of item().children; track child.id) {
                <button
                    mat-menu-item
                    class="contezza-navbar-simple-item-button"
                    [id]="child.id"
                    [attr.aria-label]="child.title | translate"
                    [attr.data-automation-id]="child.id"
                    [attr.title]="child.description || '' | translate"
                    (click)="onChildClick(child)"
                    (mouseenter)="mouseEnter()"
                    (mouseleave)="mouseLeave()"
                >
                    @if (child.icon) {
                        <mat-icon [contezzaIcon]="child.icon" />
                    }
                    <span class="contezza-navbar-simple-item-button-label">{{ child.title | translate }}</span>
                </button>
            }
        </mat-menu>`,
    styleUrls: ['dropdown.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: 'contezza-navbar-dropdown right-arrow' },
})
export class DropdownComponent {
    // constructor
    private readonly router = inject(Router);
    private readonly store = inject<Store>(Store);

    // inputs
    readonly item = input.required<NavbarItem>();

    timeout = 150;

    @Output()
    readonly titleClick = new EventEmitter<void>();

    @ViewChild(MatMenuTrigger, { static: true })
    trigger!: MatMenuTrigger;

    timedOutCloser?: Parameters<typeof clearTimeout>[0];

    @HostListener('mouseenter')
    mouseEnter() {
        if (this.timedOutCloser) {
            clearTimeout(this.timedOutCloser);
        }
        this.trigger.openMenu();
    }

    @HostListener('mouseleave')
    mouseLeave() {
        this.timedOutCloser = setTimeout(() => {
            this.trigger.closeMenu();
        }, this.timeout);
    }

    onTitleClick() {
        this.titleClick.emit();
    }

    onChildClick(item: NavbarItem) {
        const action = NavbarItemUtils.getNavigationAction(item, url => this.router.parseUrl(url));
        if (action) {
            this.store.dispatch(action);
        }
    }
}
