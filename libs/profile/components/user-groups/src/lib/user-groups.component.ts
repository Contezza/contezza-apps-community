import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';

import { TranslateModule } from '@ngx-translate/core';

import { Store } from '@ngrx/store';

import { map } from 'rxjs';

import { getUserProfile } from '@alfresco/aca-shared/store';

@Component({
    standalone: true,
    selector: 'contezza-profile-user-groups',
    template: `@if (groups(); as groups) {
        <mat-expansion-panel>
            <mat-expansion-panel-header>
                <h3 class="contezza-profile-user-groups-header">{{ 'PROFILE.USER_GROUPS.TITLE' | translate }}</h3>
            </mat-expansion-panel-header>
            <mat-list>
                @for (group of groups; track group.id) {
                    <mat-list-item>
                        <h5 class="contezza-profile-user-groups-list-item">{{ group.displayName ? group.displayName : group.id }}</h5>
                    </mat-list-item>
                }
            </mat-list>
        </mat-expansion-panel>
    }`,
    styles: [
        `
            .contezza-profile-user-groups-header {
                color: var(--theme-text-bold-color);
            }
            .contezza-profile-user-groups-list-item {
                color: var(--theme-text-color);
            }
        `,
    ],
    imports: [MatExpansionModule, MatListModule, TranslateModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserGroupsComponent {
    // constructor
    private readonly store = inject(Store);

    readonly groups = toSignal(this.store.select(getUserProfile).pipe(map(profile => profile.groups)));
}
