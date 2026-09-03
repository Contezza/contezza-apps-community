import { ENVIRONMENT_INITIALIZER, EnvironmentProviders, inject, makeEnvironmentProviders } from '@angular/core';

import { SHELL_NAVBAR_MIN_WIDTH } from '@alfresco/adf-core/shell';
import { ExtensionService } from '@alfresco/adf-extensions';

import { HeaderComponent } from '@contezza/layout/components/header';
import { SidenavComponent } from '@contezza/layout/components/sidenav';

export function provideExtension(): EnvironmentProviders {
    return makeEnvironmentProviders([
        { provide: SHELL_NAVBAR_MIN_WIDTH, useValue: 70 },
        {
            provide: ENVIRONMENT_INITIALIZER,
            multi: true,
            useValue: () => {
                const extensions = inject(ExtensionService);
                extensions.setComponents({
                    'app.layout.header': HeaderComponent,
                    'app.layout.sidenav': SidenavComponent,
                });
            },
        },
    ]);
}

export { provideExtension as provideLayoutExtension };
