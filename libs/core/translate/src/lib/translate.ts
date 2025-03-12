import { Injectable } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';

/**
 * Provides `TranslateService.instant` as a function that can directly be injected in an angular component or service.
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
