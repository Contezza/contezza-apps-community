import { inject, Injectable } from '@angular/core';

import { filter, map, Observable, ReplaySubject, Subscription, take } from 'rxjs';

import { ExtensionElement, ExtensionService } from '@alfresco/adf-extensions';

import { AdfUtils } from '@contezza/core/utils';

import { Theme } from '../models';

/**
 * Manages the app theme:
 * - Retrieves the list of available themes from app extensions. This is defined using feature key `themes`.
 * - Manages the selection of the current theme, persisting it in local storage and reading it by app initialisation.
 * - Listens to changes in the current theme and places the corresponding CSS class into the root HTML element of the page.
 */
@Injectable()
export class ThemeService {
    static readonly FEATURE_KEY = 'themes';
    static readonly STORAGE_KEY = 'contezza-theme';
    static readonly CSS_PREFIX = 'contezza-theme-';

    // constructor
    private readonly extensions = inject(ExtensionService);

    private subscription: Subscription;

    private _themes?: Theme[];
    get themes() {
        return (this._themes ??= AdfUtils.filterAndSort(this.extensions.getFeature<(Theme & ExtensionElement)[]>(ThemeService.FEATURE_KEY, [])));
    }

    private readonly activeThemeIdSource = new ReplaySubject<string | null>(1);
    readonly activeThemeId$ = this.activeThemeIdSource.asObservable();

    set activeTheme(theme: string | Theme | null) {
        this.activeThemeIdSource.next(theme && (typeof theme === 'string' ? theme : theme.id));
    }

    readonly activeTheme$: Observable<Theme | null> = this.activeThemeId$.pipe(map(id => (id && this.themes.find(theme => theme.id === id)) || null));

    /**
     * Initialises {@link ThemeService}:
     * Persists the current theme in local storage and reads it by app initialisation
     * Listens to changes in the current theme and places the corresponding CSS class into the root HTML element of the page.
     */
    init() {
        this.subscription?.unsubscribe();
        this.subscription = this.activeTheme$.subscribe(theme => {
            const { classList } = document.documentElement;
            classList.forEach(c => {
                if (c.startsWith(ThemeService.CSS_PREFIX)) {
                    classList.remove(c);
                }
            });
            if (theme) {
                localStorage.setItem(ThemeService.STORAGE_KEY, theme.id);
                if (theme.cssClass) {
                    classList.add(ThemeService.CSS_PREFIX + theme.cssClass);
                }
            } else {
                localStorage.removeItem(ThemeService.STORAGE_KEY);
            }
        });
        // initialise current theme from local storage
        // delay until ExtensionService is ready because the list of themes depends on it
        this.extensions.setup$.pipe(filter(Boolean), take(1)).subscribe(() => this.activeThemeIdSource.next(localStorage.getItem(ThemeService.STORAGE_KEY)));
    }
}
