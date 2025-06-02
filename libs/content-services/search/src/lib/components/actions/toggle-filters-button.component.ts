import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { ThemePalette } from '@angular/material/core';

import { TranslateModule } from '@ngx-translate/core';

import { Store } from '@ngrx/store';

import { map, Observable } from 'rxjs';

import { IconModule } from '@alfresco/adf-core';
import { ContentActionRef } from '@alfresco/adf-extensions';

import { SearchParametersStore } from '@contezza/content-services/search/shared';

import { SidebarContentType, SidebarStore } from '@contezza/content-services/shared';

@Component({
    standalone: true,
    imports: [CommonModule, MatButtonModule, TranslateModule, IconModule],
    selector: 'contezza-toggle-filters-button',
    template: `
        <button mat-icon-button [attr.title]="data.title | translate" [attr.aria-label]="data.title | translate" [color]="color$ | async" (click)="onClick()">
            <adf-icon [value]="icon$ | async"></adf-icon>
        </button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToggleFiltersButtonComponent {
    @Input()
    data: ContentActionRef;

    readonly icon$: Observable<string> = this.searchParameters.sidebarQuery$.pipe(
        map((query) => {
            const [nonActive, active] = this.data.icon.split('|');
            return query ? active : nonActive;
        })
    );
    readonly color$: Observable<ThemePalette> = this.sidebar.content$.pipe(map((content) => (content === SidebarContentType.Form ? 'primary' : undefined)));

    constructor(private readonly store: Store, private readonly searchParameters: SearchParametersStore, private readonly sidebar: SidebarStore) {}

    onClick() {
        this.store.dispatch({ type: this.data.actions.click });
    }
}
