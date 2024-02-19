import { Inject, Injectable, InjectionToken, Optional, Provider } from '@angular/core';

import { catchError, filter, map, Observable, of, ReplaySubject, Subject, switchMap, tap } from 'rxjs';

import { MlWebscriptService } from './ml-webscript.service';
import { PropertyApi } from './property.api';
import { PropertyRegistryService } from './property-registry.service';

export const KEY_PROPERTY_MAPPING = new InjectionToken<KeyPropertyMapping>('key-property-mapping');

export type KeyPropertyMapping = (key: string) => string | undefined;

/**
 * Defines a method `get` which transforms a key into an observable which retrieves an Alfresco property from the repository and returns its title.
 * Moreover, this observable reacts to language changes in the app (based on `@ngx-translate`) and updates the title accordingly.
 */
@Injectable({ providedIn: 'root' })
export class PropertyTitleService {
    /**
     * Defines a mapping between generic label keys and Alfresco properties.
     *
     * @param mapping A function which defines how to extract a property key from a generic key
     */
    static readonly provideKeyPropertyMapping = (mapping: KeyPropertyMapping): Provider => ({ provide: KEY_PROPERTY_MAPPING, multi: true, useValue: mapping });

    private _properties?: PropertyApi;
    private get properties() {
        return (this._properties ??= new PropertyApi(this.webscript));
    }

    constructor(
        private readonly webscript: MlWebscriptService,
        private readonly registry: PropertyRegistryService<{ mlTitle?: Record<string, string> }>,
        @Inject(KEY_PROPERTY_MAPPING) @Optional() private readonly mappings?: KeyPropertyMapping[]
    ) {}

    /**
     * Transforms a key into an observable which retrieves an Alfresco property from the repository and returns its title.
     * Moreover, this observable reacts to language changes.
     *
     * @param key
     * @param language$
     */
    get(key: string, language$?: Observable<string>): Observable<string> | undefined {
        const propertyKey = this.getPropertyKey(key);
        return propertyKey ? (language$ ? language$.pipe(switchMap((language) => this.getTitle(propertyKey, language))) : this.getTitle(propertyKey)) : undefined;
    }

    private getPropertyKey(key: string): string | undefined {
        return this.mappings?.find((mapping) => !!mapping(key))?.(key);
    }

    private getTitle(propertyKey: string, language?: string): Observable<string> {
        let registryProperty = this.registry.get(propertyKey);
        const title$: Subject<string> = new ReplaySubject<string>(1);
        let toBeGet = false;
        if (registryProperty) {
            // if the property is already in the registry
            if (!('loading' in registryProperty) || registryProperty.loading === false) {
                // if the property is not loading
                if (!language || registryProperty.mlTitle?.[language]) {
                    // if no language is specified or property already has the necessary language, then the title is defined
                    title$.next(language ? registryProperty.mlTitle?.[language] : registryProperty.title ?? propertyKey);
                    title$.complete();
                } else {
                    // mark property as to be get
                    registryProperty.loading = true;
                    toBeGet = true;
                    // add as observer of the next new title
                    registryProperty.batch.push(title$);
                }
            } else {
                // property is already loading
                // add as observer of the next new title
                registryProperty.batch.push(title$);
            }
        } else {
            // if the property is not in the registry yet, create a placeholder
            registryProperty = { loading: true, batch: [title$] };
            this.registry.set(propertyKey, registryProperty);
            // mark property as to be get
            toBeGet = true;
        }

        // actually get the property if needed
        if (toBeGet) {
            if (language) {
                this.webscript.language = language;
            }
            this.properties
                .get({ name: propertyKey })
                .pipe(
                    catchError((e) => {
                        console.warn('Cannot get property ' + propertyKey);
                        console.warn(e);
                        return of([]);
                    }),
                    map((properties) => properties[0]),
                    filter(Boolean),
                    tap((property) => {
                        // if a language is defined then update the corresponding mlTitle
                        if (language) {
                            if (!property.mlTitle) {
                                property.mlTitle = {};
                            }
                            property.mlTitle[language] = property.title ?? propertyKey;
                        }
                        // save new data in the registry
                        Object.assign(registryProperty, property);
                    }),
                    map((_) => _.title ?? propertyKey),
                    tap((title) => {
                        if (registryProperty.batch) {
                            // send the new title to all observers
                            registryProperty.batch.forEach(($) => {
                                $.next(title);
                                $.complete();
                            });
                            // clean observer list
                            registryProperty.batch = [];
                        }
                        registryProperty.loading = false;
                    })
                )
                .subscribe();
        }

        return title$;
    }
}
