import { inject, Injectable, InjectionToken } from '@angular/core';

import { InterpolationParameters, TranslateService, Translation, TranslationObject } from '@ngx-translate/core';

import { from, Observable, of, switchMap } from 'rxjs';

import { ContezzaObjectUtils } from '@contezza/core/utils';

import { Translations } from './models';

export const COMPONENT_TRANSLATIONS = new InjectionToken<Translations<any>>('component-translations');

const isPromise = <T>(x: T | Promise<T>): x is Promise<T> => x && typeof x === 'object' && 'then' in x;
const asObservable = <T>(x: T | Promise<T>): Observable<T> => (isPromise(x) ? from(x) : of(x));

@Injectable()
export class ComponentTranslateService extends TranslateService {
    // constructor
    private readonly componentTranslations: Translations<any> = inject(COMPONENT_TRANSLATIONS);

    /**
     * Overrides `TranslateService.get` as follows:
     * if the given key appears in the provided `componentTranslations`, then return the corresponding value, otherwise follow the default behaviour.
     * The returned value supports the same interpolation rules as the default `TranslateService.get`.
     *
     * @param key
     * @param interpolateParams
     */
    get(key: string | string[], interpolateParams?: InterpolationParameters): Observable<Translation | TranslationObject> {
        return asObservable(this.componentTranslations[this.currentLang]).pipe(
            switchMap((x) => {
                const value = ContezzaObjectUtils.getValue(x, Array.isArray(key) ? key.join('.') : key);
                if (value) {
                    return of(this.parser.interpolate(value, interpolateParams));
                } else {
                    return super.get(key, interpolateParams);
                }
            })
        );
    }
}
