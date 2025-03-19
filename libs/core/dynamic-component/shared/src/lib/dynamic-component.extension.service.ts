import { Injectable, Type } from '@angular/core';

import { Observable } from 'rxjs';

import { ContezzaObservables } from '@contezza/core/utils';

export type ComponentResolver<TComponent> = () => Promise<Type<TComponent>>;

@Injectable({ providedIn: 'root' })
export class DynamicComponentExtensionService {
    private readonly components: Record<string, ComponentResolver<any>> = {};

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
