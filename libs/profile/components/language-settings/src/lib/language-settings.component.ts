import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

import { TranslateModule } from '@ngx-translate/core';

import { Observable, of } from 'rxjs';

import { LanguageItem, LanguageService, UserPreferencesService } from '@alfresco/adf-core';

import { ResponsiveService } from '@contezza/core/responsive';

@Component({
    standalone: true,
    imports: [CommonModule, TranslateModule, MatButtonToggleModule, MatIconModule, MatMenuModule],
    selector: 'contezza-profile-language-settings',
    templateUrl: './language-settings.component.html',
    styles: [
        `
            :host {
                color: var(--theme-text-color);
                padding: 25px;
                width: calc(100% - 2 * 25px) !important;
            }

            mat-radio-group {
                display: flex;
                flex-direction: column;
            }

            mat-radio-button {
                height: 56px;
            }
        `,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LanguageSettingsComponent {
    // constructor
    private readonly languageService = inject(LanguageService);
    private readonly userPrefService = inject(UserPreferencesService);
    private readonly responsive? = inject(ResponsiveService, { optional: true });

    readonly languages$: Observable<LanguageItem[]> = this.languageService.languages$;
    currentLanguageSet: string = this.userPrefService.locale;

    readonly isMobile$ = this.responsive?.isMobile$ || of(false);

    changeLanguage(language: LanguageItem) {
        this.languageService.changeLanguage(language);
        this.currentLanguageSet = this.userPrefService.locale;
    }
}
