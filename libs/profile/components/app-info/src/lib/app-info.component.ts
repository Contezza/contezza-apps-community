import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';

import { AppConfigPipe } from '@alfresco/adf-core';

import { ApplyPipe } from '@contezza/core/pipes';
import { DocsService } from '@contezza/core/services';

@Component({
    standalone: true,
    imports: [CommonModule, TranslateModule, AppConfigPipe, ApplyPipe],
    selector: 'contezza-profile-app-info',
    template: `<div class="contezza-profile-app-info-logo">
            <img [src]="'application.logo' | adfAppConfig" alt="{{ 'application.name' | adfAppConfig }}" style="max-height: 104px" />
        </div>
        <div class="contezza-profile-app-info-data">
            <h3 style="margin:0">{{ 'application.name' | adfAppConfig }}</h3>
            @if ('application.version' | adfAppConfig; as version) {
                <div class="contezza-profile-app-info-data-version">
                    <div>{{ 'APP.ABOUT.VERSION' | translate }}</div>
                    @if (version | apply: makeVersionHref.bind(this); as href) {
                        <a class="contezza-profile-app-info-data-link" [href]="href" target="_blank">{{ version }}</a>
                    } @else {
                        <div>{{ version }}</div>
                    }
                </div>
            }
            @if ('application.copyright' | adfAppConfig | translate; as copyright) {
                @if (licenseRef) {
                    <a class="contezza-profile-app-info-data-link" [href]="licenseRef" target="_blank">{{ copyright }}</a>
                } @else {
                    <div>{{ copyright }}</div>
                }
            }
        </div>`,
    styleUrls: ['app-info.component.scss'],
    host: { class: 'contezza-profile-app-info' },
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppInfoComponent {
    // constructor
    private readonly docsService = inject(DocsService, { optional: true });

    readonly licenseRef = this.docsService?.getLicenseLink?.() || null;

    makeVersionHref(version: string): string | null {
        return this.docsService?.getReleaseNotesLink?.(version) || null;
    }
}
