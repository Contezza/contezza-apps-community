import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ThemePalette } from '@angular/material/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ContentActionRef, ContentActionType } from '@alfresco/adf-extensions';

import { ContezzaDynamicFormFilterService } from '../../../../services/';

@Component({
    selector: 'contezza-toggle-filter',
    templateUrl: './toggle-filter.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContezzaToggleFilterComponent {
    readonly active$: Observable<boolean> = this.filters.active$;
    readonly color$: Observable<ThemePalette> = this.filters.open$.pipe(map((open) => (open ? 'primary' : undefined)));
    readonly actionRef$: Observable<ContentActionRef> = this.filters.set$.pipe(
        map((set) => ({ id: 'toggle', type: ContentActionType.button, title: 'APP.ACTIONS.FILTER', icon: set ? 'svg:filter-variant-plus' : 'filter_list' }))
    );

    constructor(private readonly filters: ContezzaDynamicFormFilterService) {}

    toggle() {
        this.filters.toggle();
    }
}
