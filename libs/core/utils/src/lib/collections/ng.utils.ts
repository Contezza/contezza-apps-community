import { ComponentRef, InjectionToken, ModuleWithProviders, Type } from '@angular/core';

export class NgUtils {
    /**
     * Returns the list of declared input binding names for the given component.
     *
     * This reads Angular's Ivy component metadata (`ɵcmp.inputs`) from the
     * component type associated with the provided `ComponentRef`.
     *
     * It works for both:
     * - Signal inputs created with `input()` / `input.required()`
     * - Classic `@Input()` properties
     *
     * Since signal inputs are compiled into the same Ivy input metadata,
     * they are discovered the same way as decorator-based inputs.
     *
     * The returned values are the **public binding names** — i.e. the names
     * used in templates:
     *
     * `<my-component [someInput]="value" />`
     *
     * ⚠️ Important:
     * - This relies on Angular's private Ivy metadata (`ɵcmp`),
     *   which is not part of the public API and may change between versions.
     * - If metadata is unavailable, an empty array is returned.
     *
     * @param component - The `ComponentRef` whose input bindings should be inspected.
     * @returns An array of public input binding names, or an empty array if none exist.
     */
    static getComponentInputNames(component: ComponentRef<any>) {
        const inputs = (component.componentType as any).ɵcmp?.inputs;
        return inputs ? Object.keys(inputs) : [];
    }

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
