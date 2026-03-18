import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

import { TranslatePipe } from '@ngx-translate/core';

import { Observable } from 'rxjs';

import { LanguageItem, LanguageService, UserPreferencesService } from '@alfresco/adf-core';

@Component({
    standalone: true,
    imports: [CommonModule, MatIconModule, MatMenuModule, TranslatePipe],
    selector: 'contezza-profile-language-settings',
    templateUrl: 'language-settings.component.html',
    styles: [
        `
            :host {
                color: var(--theme-text-color);
                padding: 25px;
                width: calc(100% - 2 * 25px) !important;
            }
        `,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LanguageSettingsComponent {
    // constructor
    private readonly languageService = inject(LanguageService);
    private readonly userPrefService = inject(UserPreferencesService);

    readonly languages$: Observable<LanguageItem[]> = this.languageService.languages$;
    currentLanguageSet: string = this.userPrefService.locale;

    changeLanguage(language: LanguageItem) {
        this.languageService.changeLanguage(language);
        this.currentLanguageSet = this.userPrefService.locale;
    }
}
