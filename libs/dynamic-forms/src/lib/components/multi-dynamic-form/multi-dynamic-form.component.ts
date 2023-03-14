import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { DynamicFormItem } from '@contezza/dynamic-forms/shared';

import { MultiDynamicFormStore } from './multi-dynamic-form.store';

@Component({
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
