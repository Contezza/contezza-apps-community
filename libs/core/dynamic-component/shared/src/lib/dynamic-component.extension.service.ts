import { Inject, Injectable, InjectionToken, Optional, Type } from '@angular/core';

import { Observable } from 'rxjs';

import { ContezzaObservables } from '@contezza/core/utils';

export type ComponentResolver<TComponent> = () => Promise<Type<TComponent>>;

type DynamicComponentRecord<TComponent = unknown> = Record<string, ComponentResolver<TComponent>>;
const DYNAMIC_COMPONENTS = new InjectionToken<DynamicComponentRecord[]>('dynamic-components');
export const provideDynamicComponents = <TComponent>(components: DynamicComponentRecord<TComponent>) => ({
    provide: DYNAMIC_COMPONENTS,
    useValue: components,
    multi: true,
});

@Injectable({ providedIn: 'root' })
export class DynamicComponentExtensionService {
    private readonly components: Record<string, ComponentResolver<any>> = {};

    constructor(@Optional() @Inject(DYNAMIC_COMPONENTS) _dcrs?: DynamicComponentRecord[]) {
        _dcrs?.forEach((list) => this.setComponents(list));
    }

    setComponents<TComponent, TComponents extends Record<string, ComponentResolver<TComponent>> = Record<string, ComponentResolver<TComponent>>>(values: TComponents) {
        if (values) {
            Object.assign(this.components, values);
        }
    }

    hasComponent(id: string): boolean {
        return !!this._getComponent(id);
    }

    getComponent<TComponent>(id: string): Observable<Type<TComponent>> {
        const component$ = this._getComponent<TComponent>(id);
        if (!component$) {
            throw new Error('Unknown component: ' + id);
        }
        return ContezzaObservables.from(component$);
    }

    private _getComponent<TComponent>(id: string): ComponentResolver<TComponent> {
        return this.components[id];
    }
}
