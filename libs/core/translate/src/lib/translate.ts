import { inject, Injectable, InjectionToken } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';

/**
 * Provides `TranslateService.instant` as a function that can directly be injected in an angular component or service.
 *
 * @deprecated inject {@link TRANSLATE} instead
 */
@Injectable({
    providedIn: 'root',
    useFactory:
        (translate: TranslateService): TranslateService['instant'] =>
        (key, params) =>
            translate.instant(key, params),
    deps: [TranslateService],
})
export abstract class Translate extends Function {}

/**
 * Provides `TranslateService.instant` as a function that can directly be injected in an angular component or service.
 */
export const TRANSLATE = new InjectionToken<TranslateService['instant']>('TRANSLATE', {
    providedIn: 'root',
    factory:
        (translate = inject(TranslateService)) =>
        (key, params) =>
            translate.instant(key, params),
});
