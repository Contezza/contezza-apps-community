import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslateModule } from '@ngx-translate/core';

import { DynamicComponent } from '@contezza/core/dynamic-component';
import { DisplayPropertyPipe } from '@contezza/content-services/shared';

import { ResultSettings } from '@contezza/content-services/search/components/search-bar/shared';

@Component({
    standalone: true,
    selector: 'contezza-search-result',
    imports: [CommonModule, TranslateModule, DynamicComponent, DisplayPropertyPipe],
    template: `
        <contezza-dynamic-component
            class="search-result-thumbnail"
            [id]="settings.thumbnailComponent.id"
            [data]="{ item: item, column: { data: settings.thumbnailComponent.data } }"
        ></contezza-dynamic-component>
        <div class="search-result-row">
            <div class="search-result-name">{{ item | displayProperty : settings.nameFormatter | async }}</div>
            <div class="search-result-location">
                <span class="search-result-location-label">{{ 'SEARCH.LOCATION.LABEL' | translate }}:</span>
                <contezza-dynamic-component
                    [id]="settings.locationComponent.id"
                    [data]="{ item: item, column: { data: settings.locationComponent.data } }"
                    (click)="$event.stopPropagation()"
                ></contezza-dynamic-component>
            </div>
        </div>
    `,
    styleUrls: ['search-result.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchResultComponent<TItem> {
    @Input()
    item: TItem;

    @Input()
    settings: ResultSettings;
}
