import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

import { TranslatePipe } from '@ngx-translate/core';

import { Store } from '@ngrx/store';

import { ContentActionRef, ExtensionService, RuleContext } from '@alfresco/adf-extensions';

import { ItemDetailsComponent } from '@contezza/content-services/components/item-details';
import { RuleContextService } from '@contezza/core/context';
import { IconDirective } from '@contezza/core/directives';
import { RuleService } from '@contezza/core/extensions';

@Component({
    standalone: true,
    imports: [MatFabButton, MatIcon, ItemDetailsComponent, TranslatePipe, IconDirective],
    selector: 'contezza-metadata',
    templateUrl: 'metadata.component.html',
    styleUrls: ['metadata.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetadataComponent<TItem> {
    // constructor
    private readonly store = inject(Store);
    private readonly extensions = inject(ExtensionService);
    private readonly ruleContext$ = inject(RuleContextService);
    private readonly rules = inject(RuleService);

    // inputs
    readonly item = input.required<TItem>();
    readonly propertyDisplayListId = input.required<string>();
    readonly actionId = input<string>();

    private readonly ruleContext = toSignal(this.ruleContext$);
    readonly action = computed(() => {
        const actionId = this.actionId();
        if (actionId) {
            const action = this.extensions.getElements<ContentActionRef>('templates.actions').find(el => el.id === actionId);
            const context = this.ruleContext();
            const item = this.item();
            return this.rules.filterItem(action, { ...context, item } as RuleContext) ? action : null;
        } else {
            return null;
        }
    });

    onEditMetadata() {
        const action = this.action();
        const payload = this.item();
        const type = action.actions.click;
        if (type) {
            this.store.dispatch({ type, payload });
        }
    }
}
