import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatToolbar } from '@angular/material/toolbar';

import { TranslatePipe } from '@ngx-translate/core';

import { DynamicExtensionComponent } from '@alfresco/adf-extensions';

import { DynamicComponent, IsDefinedPipe } from '@contezza/core/dynamic-component';

import { Tab } from '@contezza/profile/shared';

@Component({
    standalone: true,
    selector: 'contezza-profile-tab',
    imports: [DynamicExtensionComponent, DynamicComponent, IsDefinedPipe, NgTemplateOutlet, MatToolbar, TranslatePipe],
    template: `@for (component of components(); track component.id) {
        <div [class]="'contezza-profile-tab-component-' + (component.type || 'default')">
            @switch (component.type) {
                @case ('card') {
                    @if (component.title) {
                        <mat-toolbar class="contezza-profile-tab-component-card-header">
                            <span>{{ component.title | translate }}</span>
                        </mat-toolbar>
                    }
                    <div class="contezza-profile-tab-component-card-content">
                        <ng-container *ngTemplateOutlet="content" />
                    </div>
                }
                @default {
                    @if (component.title) {
                        <h3>{{ component.title | translate }}</h3>
                    }
                    <ng-container *ngTemplateOutlet="content" />
                }
            }
        </div>

        <ng-template #content>
            @if (component.component | isDefined) {
                <contezza-dynamic-component [id]="component.component" [data]="component.inputs" />
            } @else {
                <adf-dynamic-component [id]="component.component" [data]="component.inputs" />
            }
        </ng-template>
    }`,
    styleUrls: ['tab.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabComponent {
    // inputs
    readonly tab = input.required<Tab>();

    // computed properties
    readonly components = computed(() => {
        const tab = this.tab();
        return tab.components;
    });
}
