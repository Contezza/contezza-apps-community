import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { DestroyService } from '@contezza/core/services';

@Component({
    selector: 'contezza-dynamic-form-option',
    template: ` <ng-container dynamicFormOption [component]="component" [value]="value"></ng-container> `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [DestroyService],
})
export class DynamicFormOptionComponent<ValueType> {
    @Input()
    readonly component: string;

    @Input()
    readonly value: ValueType;
}
