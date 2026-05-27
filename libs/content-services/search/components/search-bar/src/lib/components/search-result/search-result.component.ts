import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, QueryList, ViewChildren } from '@angular/core';

import { TranslatePipe } from '@ngx-translate/core';

import { ActivableDirective } from '@contezza/core/directives';
import { DynamicComponent } from '@contezza/core/dynamic-component';

import { ResultSettings } from '@contezza/content-services/search/components/search-bar/shared';
import { DisplayPropertyPipe } from '@contezza/content-services/shared';

@Component({
    standalone: true,
    selector: 'contezza-search-result',
    imports: [CommonModule, TranslatePipe, ActivableDirective, DynamicComponent, DisplayPropertyPipe],
    template: `
        <contezza-dynamic-component
            class="search-result-thumbnail"
            [id]="settings().thumbnailComponent.id"
            [data]="{ item: item(), column: { data: settings().thumbnailComponent.data } }"
        />
        <div class="search-result-row">
            <div class="search-result-name" contezzaActivable>{{ item() | displayProperty: settings().nameFormatter | async }}</div>
            <div class="search-result-location">
                <span class="search-result-location-label">{{ 'SEARCH.LOCATION.LABEL' | translate }}:</span>
                <contezza-dynamic-component
                    contezzaActivable
                    [id]="settings().locationComponent.id"
                    [data]="{ item: item(), column: { data: settings().locationComponent.data } }"
                    (click)="onLocationClick($event)"
                />
            </div>
        </div>
    `,
    styleUrls: ['search-result.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchResultComponent<TItem> {
    // inputs
    readonly item = input.required<TItem>();
    readonly settings = input.required<ResultSettings>();

    @ViewChildren(ActivableDirective)
    activableElements!: QueryList<ActivableDirective>;

    /**
     * Handles click interactions triggered from keyboard navigation.
     *
     * Some search results are rendered through `contezza-dynamic-component`,
     * where the actual navigation action is delegated to an internal element exposing `role="link"`.
     *
     * When the user activates the row through keyboard interaction
     * (e.g. pressing Enter on an active item), the click lands on the
     * outer dynamic component instead of the internal link.
     *
     * In that case, forward the interaction to the first descendant link-like
     * element so that the expected navigation behavior is preserved.
     *
     * @param event
     */
    onLocationClick(event: MouseEvent): void {
        // Prevent the click from bubbling to parent containers.
        event.stopPropagation();

        const target = event.target as HTMLElement;

        // Dynamic components do not expose the real navigation target directly on the host element.
        if (target.tagName.toLowerCase() === 'contezza-dynamic-component') {
            // Find the internal interactive element responsible for navigation.
            const link: HTMLElement = target.querySelector('*[role="link"]');

            // Trigger the delegated click interaction.
            link.click();
        }
    }
}
