import { ENVIRONMENT_INITIALIZER, inject, makeEnvironmentProviders } from '@angular/core';

import { provideDynamicComponents } from '@contezza/core/dynamic-component/shared';
import { ThemeService } from '@contezza/core/theme/shared';

/**
 * Provides and initialises {@link ThemeService}.
 */
export function provideTheme() {
    return makeEnvironmentProviders([
        ThemeService,
        {
            provide: ENVIRONMENT_INITIALIZER,
            multi: true,
            useValue: () => inject(ThemeService).init(),
        },
        provideDynamicComponents({
            'contezza-theme-selector': () => import('@contezza/core/theme/components/selector').then(m => m.SelectorComponent),
        }),
    ]);
}
