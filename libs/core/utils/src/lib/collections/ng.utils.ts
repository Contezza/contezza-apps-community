import { InjectionToken, ModuleWithProviders, Type } from '@angular/core';

export class NgUtils {
    /**
     * Utility method to create a `ModuleWithProviders` object for the given module with the given configuration. The configuration can then be retrieved by injecting the given token.
     *
     * @param ngModule
     * @param token
     * @param config
     */
    static getModuleWithConfig<TModule, TToken, TConfig>(ngModule: Type<TModule>, token: InjectionToken<TToken>, config: TConfig): ModuleWithProviders<TModule> {
        return {
            ngModule,
            providers: [{ provide: token, useValue: config }],
        };
    }
}
