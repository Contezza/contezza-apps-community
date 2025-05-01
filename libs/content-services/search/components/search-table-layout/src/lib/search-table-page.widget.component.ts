import { ChangeDetectionStrategy, Component, HostBinding, Input, ViewEncapsulation } from '@angular/core';

import { ExtendedSearchTableLayoutSettings } from '@contezza/content-services/search/shared';

import { SearchTableLayoutComponent } from './search-table-layout.component';
import { SearchTablePageService } from './search-table-page.service';

@Component({
    standalone: true,
    imports: [SearchTableLayoutComponent],
    selector: 'contezza-search-table-page-widget',
    template: `<contezza-search-table-layout
        [settings]="settings"
        [extras]="extras"
        [showWidgetHeader]="showHeader"
        [showMenuAction]="showMenuAction"
    ></contezza-search-table-layout>`,
    styleUrls: ['./search-table-page.widget.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [SearchTablePageService],
})
export class SearchTablePageWidgetComponent {
    showHeader: boolean;
    showMenuAction = false;

    @Input()
    set data(data: { configKey: string; showHeader: boolean } | { config: ExtendedSearchTableLayoutSettings }) {
        if ('configKey' in data) {
            this.configKey = data.configKey;
            this.showHeader = data.showHeader;
        } else {
            this.settings = data.config;
        }
        this.hideToolbar = true;
    }

    @Input()
    set configKey(configKey: string) {
        this.settings = this.searchTablePageService.getConfigurationByKey(configKey);
        this.extras = {
            currentFolder$: this.searchTablePageService.getCurrentFolder(this.settings),
        };
    }

    @Input()
    @HostBinding('class.hide-toolbar')
    hideToolbar = false;

    @Input()
    @HostBinding('class.hide-paginator')
    hidePaginator = false;

    settings: ExtendedSearchTableLayoutSettings;
    extras: SearchTableLayoutComponent['extras'];

    constructor(private readonly searchTablePageService: SearchTablePageService) {}
}
