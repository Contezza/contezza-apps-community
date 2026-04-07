import { ComponentRef, InjectionToken, makeEnvironmentProviders, ModuleWithProviders, Type } from '@angular/core';

export class NgUtils {
    /**
     * Creates a provider factory for registering multiple record-based values under a single
     * multi-provider `InjectionToken`.
     *
     * This helper is useful when you want to contribute keyed factory results from different
     * sources into one injectable collection. Each entry in the input object is converted into
     * a provider that produces a record in the shape of `{ [key]: value }`, where `value` is
     * created lazily through the supplied factory function.
     *
     * The resulting providers are wrapped with `makeEnvironmentProviders`, making them suitable
     * for use in Angular environment-level provider configuration.
     *
     * @typeParam T - The value type produced by each factory function.
     *
     * @param token - A multi-provider `InjectionToken` that accepts an array of
     * `Record<string, T>`.
     *
     * @returns A function that accepts an object whose keys are record keys and whose values
     * are factory functions producing instances of `T`. That function returns Angular
     * environment providers registering each entry as a separate multi-provider contribution.
     *
     * @example
     * ```ts
     * export const FEATURE_TOKEN = new InjectionToken<Record<string, MyService>[]>('FEATURE_TOKEN');
     *
     * const provideFeatureRecords = createFactoryRecordProvider(FEATURE_TOKEN);
     *
     * bootstrapApplication(AppComponent, {
     *   providers: [
     *     provideFeatureRecords({
     *       users: () => new UsersService(),
     *       admin: () => new AdminService(),
     *     }),
     *   ],
     * });
     * ```
     *
     * In this example, Angular registers two multi-provider entries:
     * - `{ users: UsersServiceInstance }`
     * - `{ admin: AdminServiceInstance }`
     *
     * These can later be injected as:
     * ```ts
     * inject(FEATURE_TOKEN); // Record<string, MyService>[]
     * ```
     */
    static createFactoryRecordProvider<T>(token: InjectionToken<Record<string, T>[]>) {
        return (data: Record<string, () => T>) =>
            makeEnvironmentProviders(
                Object.entries(data).map(([key, value]) => ({
                    provide: token,
                    useFactory: () => ({ [key]: value() }),
                    multi: true,
                })),
            );
    }

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
