import { ChangeDetectionStrategy, Component, computed, effect, HostBinding, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import { TranslateModule } from '@ngx-translate/core';

import { Store } from '@ngrx/store';

import { RuleContext } from '@alfresco/adf-extensions';

import { RuleContextService } from '@contezza/core/context';
import { ContezzaLetDirective, IconDirective } from '@contezza/core/directives';
import { ApplyPipe } from '@contezza/core/pipes';
import { OrArray } from '@contezza/core/utils';
import { RuleService } from '@contezza/core/extensions';
import { ContentServicesExtensionService, DisplayPropertyPipe } from '@contezza/content-services/shared';
import { TranslatePropertyTitlePipe } from '@contezza/core/property-titles';
import { DynamicComponent } from '@contezza/core/dynamic-component';

@Component({
    standalone: true,
    imports: [CommonModule, MatIconModule, TranslateModule, ContezzaLetDirective, ApplyPipe, IconDirective, DisplayPropertyPipe, TranslatePropertyTitlePipe, DynamicComponent],
    selector: 'contezza-item-details',
    templateUrl: 'item-details.component.html',
    styleUrls: ['item-details.component.scss'],
    host: { class: 'contezza-item-details' },
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemDetailsComponent<TItem> {
    // @Input()
    readonly item = input.required<TItem>();

    // @Input()
    private readonly id = input.required<string>();

    @HostBinding('id')
    // @ts-ignore
    private _id?: string;

    private readonly ruleContext = toSignal(this.ruleContext$);
    readonly list = computed(() => {
        console.log('compute list!!!');
        const context = this.ruleContext();
        const item = this.item();
        const list = this.extensions.getPropertyDisplayListById(this.id());
        return list ? this.rules.filterList(list, { ...context, item } as RuleContext) : [];
    });

    constructor(
        private readonly store: Store,
        private readonly rules: RuleService,
        private readonly ruleContext$: RuleContextService,
        private readonly extensions: ContentServicesExtensionService
    ) {
        effect(() => (this._id = this.id()));
    }

    readonly ifArray = (x: OrArray<any>): any[] | undefined => (Array.isArray(x) ? x : undefined);

    execute(type: string, payload: any) {
        this.store.dispatch({ type, payload });
    }
}
