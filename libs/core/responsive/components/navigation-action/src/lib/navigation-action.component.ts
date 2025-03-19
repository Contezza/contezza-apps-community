import { ChangeDetectionStrategy, Component, HostBinding, Input, Optional } from '@angular/core';

import { takeUntil } from 'rxjs/operators';

import { ContentActionRef, ContentActionType } from '@alfresco/adf-extensions';
import { SharedToolbarModule } from '@alfresco/aca-shared';

import { DestroyService } from '@contezza/core/services';
import { ResponsiveService } from '@contezza/core/responsive';

@Component({
    standalone: true,
    imports: [SharedToolbarModule],
    selector: 'contezza-responsive-navigation-action',
    template: `<aca-toolbar-action [actionRef]="actionRef" (click)="actionRef.click()"></aca-toolbar-action>`,
    styles: [
        `
            :host:not(.mobile) {
                display: none;
            }
        `,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [DestroyService],
})
export class NavigationActionComponent {
    @Input()
    set action(action: 'toggle-sidenav' | (() => void)) {
        this.actionRef =
            typeof action === 'string'
                ? { id: 'toggle-sidenav', type: ContentActionType.default, icon: 'menu_open', click: () => document.getElementById('adf-sidebar-toggle-start')?.click() }
                : { id: 'back', type: ContentActionType.default, icon: 'arrow_back', click: () => action() };
    }

    actionRef: ContentActionRef & { click: () => void };

    @HostBinding('class.mobile')
    isMobile = false;

    constructor(@Optional() responsive: ResponsiveService, destroy$: DestroyService) {
        responsive?.isMobile$.pipe(takeUntil(destroy$)).subscribe((value) => (this.isMobile = value));
    }
}
