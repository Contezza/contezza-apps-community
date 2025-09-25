import { TranslateService } from '@ngx-translate/core';

import { COMPONENT_TRANSLATIONS, ComponentTranslateService } from './component-translate.service';
import { Translation, Translations } from './models';

/**
 * Provides a (promise of) js object as translation file at component level.
 * This means that the `translate` pipe (used in the angular component template) will resolve all keys defined in the translation file to the corresponding value.
 *
 * @param translations
 */
export const provideComponentTranslations = <T extends Translation>(translations: Translations<T>) => [
    { provide: COMPONENT_TRANSLATIONS, useValue: translations },
    {
        provide: TranslateService,
        useClass: ComponentTranslateService,
    },
];
