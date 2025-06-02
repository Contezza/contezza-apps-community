import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import { TranslateModule } from '@ngx-translate/core';

import { Store } from '@ngrx/store';

import { map, Observable } from 'rxjs';

import { RuleContext } from '@alfresco/adf-extensions';

import { RuleContextService } from '@contezza/core/context';
import { ContezzaLetDirective, IconDirective } from '@contezza/core/directives';
import { ApplyPipe } from '@contezza/core/pipes';
import { OrArray } from '@contezza/core/utils';
import { RuleService } from '@contezza/core/extensions';
import { ContentServicesExtensionService, DisplayPropertyPipe, PropertyDisplay } from '@contezza/content-services/shared';
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
    @Input()
    item!: TItem;

    @Input()
    set id(id: string) {
        this._id = id;
        this._list = this.extensions.getPropertyDisplayListById(id);
    }

    @HostBinding('id')
    // @ts-ignore
    private _id?: string;

    private _list?: ({ id: string } & PropertyDisplay)[];

    readonly list$: Observable<({ id: string } & PropertyDisplay)[]> = this.ruleContext$.pipe(
        map((context) => (this._list ? this.rules.filterList(this._list, { ...context, item: this.item } as RuleContext) : []))
    );

    constructor(
        private readonly store: Store,
        private readonly rules: RuleService,
        private readonly ruleContext$: RuleContextService,
        private readonly extensions: ContentServicesExtensionService
    ) {}

    readonly ifArray = (x: OrArray<any>): any[] | undefined => (Array.isArray(x) ? x : undefined);

    execute(type: string, payload: any) {
        this.store.dispatch({ type, payload });
    }
}
