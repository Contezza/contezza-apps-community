import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { TranslatePipe } from '@ngx-translate/core';

import { Theme, ThemeService } from '@contezza/core/theme/shared';

@Component({
    standalone: true,
    imports: [TranslatePipe],
    selector: 'contezza-theme-selector',
    template: `@for (theme of themes; track theme.id) {
        <div class="contezza-theme-selector-item" tabindex="0" [class.active]="activeThemeId() === theme.id" (keydown.enter)="set(theme)" (click)="set(theme)">
            @if (theme.image) {
                <img [src]="theme.image" [alt]="theme.id" />
            }
            @if (theme.label) {
                <div>{{ theme.label | translate }}</div>
            }
        </div>
    }`,
    styleUrls: ['selector.component.scss'],
    host: { class: 'contezza-theme-selector' },
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectorComponent {
    // constructor
    private readonly themeService = inject(ThemeService);

    readonly themes = this.themeService.themes;
    readonly activeThemeId = toSignal(this.themeService.activeThemeId$);

    set(theme: Theme) {
        this.themeService.activeTheme = theme;
    }
}
