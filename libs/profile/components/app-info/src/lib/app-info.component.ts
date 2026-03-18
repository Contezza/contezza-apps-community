import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';

import { AppConfigPipe } from '@alfresco/adf-core';

import { ApplyPipe } from '@contezza/core/pipes';

@Component({
    standalone: true,
    imports: [CommonModule, TranslateModule, AppConfigPipe, ApplyPipe],
    selector: 'contezza-profile-app-info',
    template: `<div class="contezza-profile-tab-component-card-content">
        <div class="contezza-profile-app-info-logo">
            <img [src]="'application.logo' | adfAppConfig" alt="{{ 'application.name' | adfAppConfig }}" style="max-height: 104px" />
        </div>
        <div class="contezza-profile-app-info-data">
            <h3>{{ 'application.name' | adfAppConfig }}</h3>
            @if ('application.version' | adfAppConfig; as version) {
                <div class="contezza-profile-app-info-data-version">
                    <p>{{ 'APP.ABOUT.VERSION' | translate }}</p>
                    @if (version | apply: makeVersionHref.bind(this); as href) {
                        <a [href]="href" target="_blank">{{ version }}</a>
                    } @else {
                        <div>{{ version }}</div>
                    }
                </div>
            }
            <p>{{ 'application.copyright' | adfAppConfig | translate }}</p>
        </div>
    </div>`,
    styleUrls: ['app-info.component.scss'],
    host: { class: 'contezza-profile-app-info contezza-profile-tab-component-card' },
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppInfoComponent {
    docsUrl?: string;

    makeVersionHref(version: string): string | null {
        const { docsUrl } = this;
        return docsUrl ? docsUrl + '/#release-' + version.replace(/\./g, '-') : null;
    }
}
