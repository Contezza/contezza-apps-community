import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLinkWithHref } from '@angular/router';

import { Observable } from 'rxjs';

import { ContentActionRef } from '@alfresco/adf-extensions';
import { AppExtensionService, AppSettingsService, SharedToolbarModule } from '@alfresco/aca-shared';

@Component({
    standalone: true,
    imports: [CommonModule, RouterLinkWithHref, SharedToolbarModule],
    selector: 'contezza-sidenav-header',
    templateUrl: 'header.component.html',
    styleUrls: ['header.component.scss'],
    host: {
        class: 'contezza-sidenav-header',
    },
})
export class HeaderComponent {
    readonly redirectUrl = '';

    readonly appName: string = this.settings.appName;
    readonly actions$: Observable<ContentActionRef[]> = this.appExtensions.getHeaderActions();

    constructor(private readonly settings: AppSettingsService, private readonly appExtensions: AppExtensionService) {}

    trackByActionId(_: number, action: ContentActionRef) {
        return action.id;
    }
}
