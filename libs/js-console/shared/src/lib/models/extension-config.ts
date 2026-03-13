import { InjectionToken } from '@angular/core';

export enum ServiceKey {
    LEGACY = 'legacy',
    OOTB = 'ootb',
}

export interface ExtensionConfig {
    /**
     * Default path used to navigate to the library router module.
     */
    path?: string;
    /**
     * Service the js-console is based on. This property is implemented to transition to OOTB support tools. If defaults to the legacy service.
     */
    service?: ServiceKey;
}

export const EXTENSION_CONFIG = new InjectionToken<ExtensionConfig>('js-console-extension-config');
