import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Store } from '@ngrx/store';

import { Node, PathElement } from '@alfresco/js-api';

import { navigateToFolder } from '@contezza/core/actions';

import { ColumnComponent, LocationService } from '@contezza/content-services/shared';

@Component({
    standalone: true,
    imports: [CommonModule],
    selector: 'contezza-location-column',
    template: `<span *ngIf="location" role="link" class="adf-datatable-cell-value" title="{{ location.name }}" (click)="onClick()">{{ location.name }}</span>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'adf-datatable-content-cell adf-datatable-link adf-name-column aca-custom-name-column',
    },
})
export class LocationColumnComponent extends ColumnComponent<Node, string | undefined> implements OnInit {
    location?: PathElement;

    constructor(private readonly store: Store, private readonly locationService: LocationService) {
        super();
    }

    ngOnInit() {
        this.location = this.locationService.getLocation(this.item, this.column.data);
    }

    onClick() {
        this.store.dispatch(navigateToFolder({ payload: { entry: this.location as Node } }));
    }
}
