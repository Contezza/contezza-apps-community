import { NgModule } from '@angular/core';

import { ExtensionService } from '@alfresco/adf-extensions';

import { CONTEXT_MENU_SETTINGS } from '@contezza/core/context';

import { ResponsiveService, ScreenSize } from './responsive.service';

@NgModule({
    providers: [
        ResponsiveService,
        {
            provide: CONTEXT_MENU_SETTINGS,
            multi: true,
            useFactory: (responsiveService: ResponsiveService) => responsiveService.settings,
            deps: [ResponsiveService],
        },
    ],
})
export class ResponsiveModule {
    constructor(extensions: ExtensionService, responsive: ResponsiveService) {
        responsive.init();

        extensions.setEvaluators({
            'responsive.isMobile': () => document.documentElement.classList.contains(responsive.getCssClass(ScreenSize.MOBILE)),
        });
    }
}
