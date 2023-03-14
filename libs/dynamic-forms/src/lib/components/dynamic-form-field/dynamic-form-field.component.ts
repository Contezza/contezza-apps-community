import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

import { DestroyService } from '@contezza/core/services';
import { ContezzaDynamicFormField } from '@contezza/dynamic-forms/shared';

@Component({
    selector: 'contezza-dynamic-form-field',
    template: `<ng-container contezzaDynamicFormField [field]="field" [control]="control"></ng-container>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [DestroyService],
})
export class DynamicFormFieldComponent {
    @Input()
    readonly field: ContezzaDynamicFormField;

    @Input()
    readonly control: FormControl;
}
