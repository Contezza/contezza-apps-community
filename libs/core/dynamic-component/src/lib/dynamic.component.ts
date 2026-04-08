import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';

import { defer, ReplaySubject } from 'rxjs';

import { ComponentResolver, DynamicComponentExtensionService } from '@contezza/core/dynamic-component/shared';
import { ContezzaObservables } from '@contezza/core/utils';

import { CreatorComponent } from './creator.component';

/**
 * Resolves the dynamic component and instantiates the creator component.
 */
@Component({
    standalone: true,
    imports: [CommonModule, CreatorComponent],
    selector: 'contezza-dynamic-component',
    template: `<ng-container *ngIf="component$ | async as component">
        <contezza-creator [data]="data" [component]="component" (ready)="onComponentReady($event)" />
    </ng-container>`,
    styles: [
        `
            :host > contezza-creator + ::ng-deep* {
                display: block;
                width: 100%;
                height: 100%;
            }
        `,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicComponent<TComponent extends object> {
    /**
     * Unique identifier of the component.
     */
    @Input()
    @HostBinding('id')
    id?: string;

    @Input()
    component?: ComponentResolver<TComponent>;

    /**
     * Additional data.
     */
    @Input()
    data?: TComponent;

    readonly component$ = defer(() => {
        if (this.id) {
            return this.dc.getComponent<TComponent>(this.id);
        } else if (this.component) {
            return ContezzaObservables.from(this.component);
        } else {
            throw new Error('Input `id` or `component` required.');
        }
    });

    readonly componentReady$ = new ReplaySubject<TComponent>(1);

    constructor(private readonly dc: DynamicComponentExtensionService) {}

    onComponentReady(component: TComponent) {
        this.componentReady$.next(component);
        this.componentReady$.complete();
    }
}
