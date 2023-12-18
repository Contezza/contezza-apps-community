import { Inject, Injectable, InjectionToken, Optional, Provider } from '@angular/core';

export interface Config {
    /**
     * Default path used to navigate to javascript-console from other pages, e.g. via action `[JS_CONSOLE] OPEN_NODE`.
     */
    path?: string;
}

export const CONFIG = new InjectionToken<Config>('config');

@Injectable()
export class ConfigService implements Config {
    /**
     * Utility method to provide `ConfigService` with the given configuration.
     *
     * @param config `ConfigService` configuration.
     */
    static readonly provide = (config?: Config): Provider => [...(config ? [{ provide: CONFIG, useValue: config }] : []), ConfigService];

    readonly path?: string;

    constructor(@Inject(CONFIG) @Optional() config?: Config) {
        if (config) {
            Object.assign(this, config);
        }
    }
}
