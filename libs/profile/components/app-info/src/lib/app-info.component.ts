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
            <h3>{{ 'application.name' | adfAppConfig }}</h3>
            @if ('application.version' | adfAppConfig; as version) {
                <div class="contezza-profile-app-info-data-version">
                    <p>{{ 'APP.ABOUT.VERSION' | translate }}</p>
                    @if (version | apply: makeVersionHref.bind(this); as href) {
                        <a class="contezza-profile-app-info-data-version-link" [href]="href" target="_blank">{{ version }}</a>
                    } @else {
                        <div>{{ version }}</div>
                    }
                </div>
            }
            <p>{{ 'application.copyright' | adfAppConfig | translate }}</p>
        </div>`,
    styleUrls: ['app-info.component.scss'],
    host: { class: 'contezza-profile-app-info' },
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppInfoComponent {
    // constructor
    private readonly docsService = inject(DocsService, { optional: true });

    makeVersionHref(version: string): string | null {
        return this.docsService?.getReleaseNotesLink(version) || null;
    }
}
