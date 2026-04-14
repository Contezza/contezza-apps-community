import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

import { Observable } from 'rxjs';

import { LanguageItem, LanguageService, UserPreferencesService } from '@alfresco/adf-core';

@Component({
    standalone: true,
    imports: [CommonModule, MatIconModule, MatMenuModule],
    selector: 'contezza-profile-language-settings',
    template: `@for (language of languages$ | async; track language.key) {
        <button mat-menu-item (click)="changeLanguage(language)">
            @if (language.key === currentLanguageSet) {
                <mat-icon *ngIf="language.key === currentLanguageSet">done</mat-icon>
            }
            {{ language.label }}
        </button>
    }`,
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
