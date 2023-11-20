import { Inject, Injectable, InjectionToken, Optional, Provider, SkipSelf } from '@angular/core';

import { Settings } from '../models';

const SETTINGS = new InjectionToken<Partial<Settings>>('settings');

/**
 * Provides generic dynamic-form settings.
 *
 * This service:
 * - is provided in root with default settings,
 * - can be overwritten to provide custom settings by using the `SettingsService.provide` static method,
 * - follows a hierarchical structure, i.e. any new instance inherits all settings of its parent.
 *
 * Supported settings (default value in brackets):
 * - `typingDebounceTime` (`500`) -  Defines how much idle time (in ms) must pass before a user typing operation can be considered over and further processed.
 */
@Injectable({ providedIn: 'root' })
export class SettingsService implements Settings {
    static readonly provide = (settings: Partial<Settings> = {}): Provider[] => [
        {
            provide: SETTINGS,
            useValue: settings,
        },
        SettingsService,
    ];
    static readonly DEFAULT: Settings = {
        typingDebounceTime: 500,
    };

    typingDebounceTime: number;

    constructor(@Optional() @SkipSelf() parentSettings?: SettingsService, @Inject(SETTINGS) @Optional() settings?: Partial<Settings>) {
        this.patch(SettingsService.DEFAULT, parentSettings, settings);
    }

    patch(...settings: Partial<Settings>[]): SettingsService {
        Object.assign(this, ...settings);
        return this;
    }
}
