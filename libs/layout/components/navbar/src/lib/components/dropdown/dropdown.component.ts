import { CommonModule } from '@angular/common';
import { Component, HostBinding, HostListener, Input, ViewChild } from '@angular/core';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';

@Component({
    standalone: true,
    imports: [CommonModule, MatMenuModule],
    selector: 'contezza-dropdown',
    template: `<ng-content select="[contezza-dropdown-trigger]" />
        <div #menuTrigger="matMenuTrigger" class="fake-menu-trigger" [matMenuTriggerFor]="menu"></div>
        <mat-menu #menu="matMenu" [hasBackdrop]="false" xPosition="before" class="contezza-dropdown-menu">
            <div (mouseenter)="mouseEnter()" (mouseleave)="mouseLeave()">
                <ng-content select="[contezza-dropdown-menu]" />
            </div>
        </mat-menu>`,
    styleUrls: ['dropdown.component.scss'],
    host: { class: 'contezza-dropdown ' },
})
export class DropdownComponent {
    @Input()
    timeout = 150;

    @ViewChild(MatMenuTrigger, { static: true })
    trigger!: MatMenuTrigger;

    timedOutCloser?: Parameters<typeof clearTimeout>[0];

    @HostBinding('class.right-arrow')
    rightArrow = true;

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
}
