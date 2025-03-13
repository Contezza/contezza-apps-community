import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { defer, ReplaySubject } from 'rxjs';

import { ContezzaObservables } from '@contezza/core/utils';

import { ComponentResolver, DynamicComponentExtensionService } from '@contezza/core/dynamic-component/shared';

import { CreatorComponent } from './creator.component';

/**
 * Resolves the dynamic component and instantiates the creator component.
 */
@Component({
    standalone: true,
    imports: [CommonModule, CreatorComponent],
    selector: 'contezza-dynamic-component',
    template: `<ng-container *ngIf="component$ | async as component">
        <contezza-creator [data]="data" [component]="component" (ready)="onComponentReady($event)"></contezza-creator>
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
    readonly id?: string;

    @Input()
    readonly component?: ComponentResolver<TComponent>;

    /**
     * Additional data.
     */
    @Input()
    readonly data?: TComponent;

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
