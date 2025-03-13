import { SkipSelf } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';

import { lastValueFrom, of } from 'rxjs';

import { Translation, Translations } from './models';

const isPromise = <T>(x: T | Promise<T>): x is Promise<T> => x && typeof x === 'object' && 'then' in x;
const asPromise = <T>(x: T | Promise<T>): Promise<T> => (isPromise(x) ? x : lastValueFrom(of(x)));

/**
 * Provides a (promise of) js object as translation file at component level.
 * This means that the `translate` pipe (used in the angular component template) will resolve all keys defined in the translation file to the corresponding value.
 * N.B.: any provided translation is still application scoped.
 *
 * @param translations
 */
export const provideComponentTranslations = <T extends Translation>(translations: Translations<T>) => ({
    provide: TranslateService,
    useFactory: (translate: TranslateService) => {
        Object.entries(translations).forEach(([key, value$]) => asPromise(value$).then((value) => translate.setTranslation(key, value, true)));
        return translate;
    },
    deps: [[TranslateService, new SkipSelf()]],
});
