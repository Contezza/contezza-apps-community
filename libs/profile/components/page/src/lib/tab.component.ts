import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { DynamicExtensionComponent } from '@alfresco/adf-extensions';

import { DynamicComponent, IsDefinedPipe } from '@contezza/core/dynamic-component';
import { Tab } from '@contezza/profile/shared';

@Component({
    standalone: true,
    selector: 'contezza-profile-tab',
    imports: [DynamicExtensionComponent, DynamicComponent, IsDefinedPipe],
    template: `@for (component of components(); track component.id) {
        @if (component.id | isDefined) {
            <contezza-dynamic-component [id]="component.id" [data]="component.data" />
        } @else {
            <adf-dynamic-component [id]="component.id" [data]="component.data" />
        }
    }`,
    styles: [
        `
            /*.contezza-profile-tab-components-container {*/
            /*    height: calc(100vh - 110px);*/
            /*    overflow: auto;*/
            /*}*/
            :host {
                margin: 12px 10px;
                display: flex;
                flex-direction: column;
                gap: 16px;
            }
            :host ::ng-deep contezza-dynamic-component > contezza-creator + * {
                height: auto !important;
            }
        `,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabComponent {
    // inputs
    readonly tab = input.required<Tab>();

    // computed properties
    readonly components = computed(() => {
        const tab = this.tab();
        return tab.components.map(({ component }) => (typeof component === 'string' ? { id: component } : component));
    });
}
