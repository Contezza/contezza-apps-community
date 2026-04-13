import { ENVIRONMENT_INITIALIZER, inject, makeEnvironmentProviders } from '@angular/core';

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
    ]);
}
