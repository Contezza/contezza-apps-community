import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatExpansionModule } from '@angular/material/expansion';

import { TranslatePipe } from '@ngx-translate/core';

import { PeopleContentService } from '@alfresco/adf-content-services';
import { CORE_PIPES } from '@alfresco/adf-core';

import { ItemDetailsComponent } from '@contezza/content-services/components/item-details';

@Component({
    standalone: true,
    imports: [MatExpansionModule, TranslatePipe, ItemDetailsComponent, CORE_PIPES],
    selector: 'contezza-profile-user-info',
    template: `@if (user(); as user) {
        <mat-expansion-panel [expanded]="true">
            <mat-expansion-panel-header>
                <h3 class="contezza-profile-user-info-header">{{ 'PROFILE.USER_INFO.TITLE' | translate }}</h3>
            </mat-expansion-panel-header>
            <div class="contezza-profile-user-info-content">
                <div>
                    <div [outerHTML]="user | usernameInitials: 'adf-userinfo-pic'"></div>
                </div>
                <div class="contezza-profile-user-info-content-details">
                    <span id="adf-userinfo-identity-name-display" class="adf-userinfo-name">{{ user | fullName }}</span>
                    <contezza-item-details [id]="ID" [item]="user" />
                </div>
            </div>
        </mat-expansion-panel>
    }`,
    styleUrls: ['user-info.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserInfoComponent {
    readonly ID = 'profile.property-display-lists.identity-user-details';

    // constructor
    private readonly peopleContent = inject(PeopleContentService);

    readonly user = toSignal(this.peopleContent.getCurrentUserInfo());
}
