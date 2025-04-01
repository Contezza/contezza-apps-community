import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

import { TranslateModule } from '@ngx-translate/core';

import { Store } from '@ngrx/store';

import { map, Observable } from 'rxjs';

import { IconModule } from '@alfresco/adf-core';
import { ContentActionRef } from '@alfresco/adf-extensions';

import { ViewStore } from '@contezza/content-services/shared';

@Component({
    standalone: true,
    imports: [CommonModule, MatButtonModule, TranslateModule, IconModule],
    selector: 'contezza-toggle-view-button',
    template: `
        <button mat-icon-button [attr.title]="data.title | translate" [attr.aria-label]="data.title | translate" (click)="onClick()">
            <adf-icon [value]="icon$ | async"></adf-icon>
        </button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToggleViewButtonComponent {
    @Input()
    data: ContentActionRef;

    readonly icon$: Observable<string> = this.view.expanded$.pipe(
        map((expanded) => {
            const [nonExpandedIcon, expandedIcon] = this.data.icon.split('|');
            return expanded ? expandedIcon : nonExpandedIcon;
        })
    );

    constructor(private readonly store: Store, private readonly view: ViewStore) {}

    onClick() {
        this.store.dispatch({ type: this.data.actions.click });
    }
}
