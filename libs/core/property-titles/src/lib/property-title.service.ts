import { Inject, Injectable, InjectionToken, Optional, Provider } from '@angular/core';

import { catchError, filter, map, Observable, of, switchMap, tap } from 'rxjs';

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
        // read property from registry
        const registryProperty = this.registry.get(propertyKey);
        let title: string | undefined;
        if (registryProperty) {
            // if the property is already in the registry
            // if no language is defined or property already has the necessary language, then the title is defined
            title = language ? registryProperty.mlTitle?.[language] : registryProperty.title ?? propertyKey;
        }
        if (typeof title === 'string') {
            // if the title is defined then return it
            return of(title);
        } else {
            // else get the property
            if (language) {
                this.webscript.language = language;
            }
            return this.properties.get({ name: propertyKey }).pipe(
                catchError((e) => {
                    console.warn('Cannot get property ' + propertyKey);
                    console.warn(e);
                    return of([]);
                }),
                map((properties) => properties[0]),
                filter(Boolean),
                tap((property) => {
                    // save new data in the registry
                    // if the property was already in the registry, then its mlTitle must be updated
                    if (!registryProperty) {
                        this.registry.set(propertyKey, property);
                    }
                    if (language) {
                        // if a language is defined then update the corresponding mlTitle
                        const toUpdate: typeof registryProperty = registryProperty ?? property;
                        if (!toUpdate.mlTitle) {
                            toUpdate.mlTitle = {};
                        }
                        toUpdate.mlTitle[language] = property.title ?? propertyKey;
                    }
                }),
                map((_) => _.title ?? propertyKey)
            );
        }
    }
}
