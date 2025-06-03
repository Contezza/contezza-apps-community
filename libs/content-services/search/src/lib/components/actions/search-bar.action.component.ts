import { ChangeDetectionStrategy, Component, EventEmitter, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { Store } from '@ngrx/store';

import { defer, Observable, of } from 'rxjs';

import { navigateTo } from '@contezza/core/actions';
import { ContentServicesSearchExtensionService, navigateToResults } from '@contezza/content-services/search/shared';
import { SearchBarSettings } from '@contezza/content-services/search/components/search-bar/shared';
import { SearchBarComponent } from '@contezza/content-services/search/components/search-bar';
import { ActionComponent } from '@contezza/content-services/shared';

interface Data {
    configId: string;
}

@Component({
    standalone: true,
    imports: [CommonModule, SearchBarComponent],
    selector: 'contezza-search-bar-action',
    template: `<contezza-search-bar [id]="data.configId" *ngIf="settings$ | async as settings" [settings]="settings" (search)="onSearch($event)"></contezza-search-bar>`,
    styles: [
        `
            :host {
                display: block;
            }
            contezza-search-bar {
                width: 100%;
            }
        `,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchBarActionComponent extends ActionComponent<Data> {
    readonly settings$: Observable<SearchBarSettings> = defer(() => of(this.extensions.getSearchBarConfigurationByKey(this.data.configId)));

    @ViewChild(SearchBarComponent)
    readonly searchBar!: SearchBarComponent;

    constructor(router: Router, private readonly store: Store, private readonly extensions: ContentServicesSearchExtensionService) {
        super();
        router.events.subscribe(() => this.searchBar.closePanel());
    }

    onSearch(payload: SearchBarComponent['search'] extends EventEmitter<infer PayloadType> ? PayloadType : never) {
        if ('q' in payload) {
            this.store.dispatch(navigateToResults({ payload }));
        } else {
            this.store.dispatch(navigateTo({ payload }));
        }
    }
}
