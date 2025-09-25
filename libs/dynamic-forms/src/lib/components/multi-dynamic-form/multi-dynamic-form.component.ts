import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

import { TranslateModule } from '@ngx-translate/core';

import { ContezzaLetModule } from '@contezza/core/directives';
import { DynamicFormItem } from '@contezza/dynamic-forms/shared';

import { ContezzaDynamicFormModule } from '../dynamic-form';
import { MultiDynamicFormStore } from './multi-dynamic-form.store';

@Component({
    standalone: true,
    imports: [CommonModule, MatButtonModule, TranslateModule, ContezzaLetModule, ContezzaDynamicFormModule],
    selector: 'contezza-multi-dynamic-form',
    templateUrl: './multi-dynamic-form.component.html',
    styleUrls: ['./multi-dynamic-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiDynamicFormComponent extends MultiDynamicFormStore<DynamicFormItem> {
    @Input()
    set items(items: DynamicFormItem[]) {
        this.initialize(items);
    }

    @Input()
    set enabledItems(items: { id: string }[]) {
        this.enable(items);
    }

    @Input()
    set activeItem(activeItem: DynamicFormItem) {
        this.patchState({ activeItem });
    }
}
