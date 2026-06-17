import { ChangeDetectionStrategy, Component } from '@angular/core';

import { TranslatePipe } from '@ngx-translate/core';

import { TRANSLATIONS } from '../../i18n';
import { NavbarItemUtils } from '../../utils';
import { DropdownComponent } from '../dropdown/dropdown.component';
import { ItemComponent } from '../item.component';
import { SimpleItemComponent } from '../simple-item/simple-item.component';

@Component({
    standalone: true,
    imports: [TranslatePipe, SimpleItemComponent, DropdownComponent],
    selector: 'contezza-navbar-item-with-children',
    templateUrl: 'item-with-children.component.html',
    styleUrls: ['item-with-children.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'contezza-navbar-item-with-children',
    },
})
export class ItemWithChildrenComponent extends ItemComponent {
    readonly TRANSLATIONS = TRANSLATIONS.CONTEZZA.NAVBAR.ITEM_WITH_CHILDREN;

    onTitleClick() {
        if (!this.active && !NavbarItemUtils.hasNavigationAction(this.item())) {
            const child = NavbarItemUtils.getNavigationTargetChild(this.item());
            if (child) {
                this.navigateTo(child);
            }
        }
    }

    protected get active(): boolean {
        const thisActive = this.isActive(this.item());
        const childActive = !!this.item().children?.some(child => this.isActive(child));
        if (thisActive && !childActive) {
            const child = NavbarItemUtils.getNavigationTargetChild(this.item());
            if (child) {
                // navigate with replaceUrl=true when the parent item redirects to a child
                this.navigateTo(child, { replaceUrl: true });
            }
        }
        return thisActive || childActive;
    }
}
