import { CommonModule } from '@angular/common';
import { Component, Input, ViewEncapsulation } from '@angular/core';

import { Observable } from 'rxjs';

import { AppExtensionService, AppSettingsService, SharedToolbarModule } from '@alfresco/aca-shared';
import { SidenavLayoutComponent, SidenavLayoutModule } from '@alfresco/adf-core';
import { ContentActionRef } from '@alfresco/adf-extensions';

@Component({
    standalone: true,
    imports: [CommonModule, SidenavLayoutModule, SharedToolbarModule],
    selector: 'contezza-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    encapsulation: ViewEncapsulation.None,
    host: { class: 'contezza-header' },
})
export class HeaderComponent {
    @Input()
    data: { layout: SidenavLayoutComponent };

    readonly appName: { title: string; env?: string } = this.formatAppName(this.settings.appName);
    readonly actions$: Observable<ContentActionRef[]> = this.appExtensions.getHeaderActions();

    constructor(
        private readonly settings: AppSettingsService,
        private readonly appExtensions: AppExtensionService,
    ) {}

    onToggle() {
        this.data.layout.toggleMenu();
    }

    trackByActionId(_: number, action: ContentActionRef) {
        return action.id;
    }

    getEnvClass(appName: { title: string; env?: string }): string {
        return appName.env ? `contezza-layout-header-${appName.env}` : '';
    }

    private formatAppName(appName: string): { title: string; env?: string } {
        const envs = ['dev', 'ont', 'acc', 'prod', 'test'];
        const separator = '-';
        if (envs.some(env => appName.toLowerCase().endsWith(`${separator} ${env}`))) {
            const splitAppName = appName.split(separator);
            const env = splitAppName.pop().trim();
            const title = splitAppName.join(separator).trim();
            return { title, env };
        } else {
            return { title: appName };
        }
    }
}
