import { ChangeDetectionStrategy, Component, Input, OnInit, Type, ViewContainerRef } from '@angular/core';
import { FormControl } from '@angular/forms';

import { ContezzaBaseFieldComponentInterface, ContezzaDynamicFormField } from '@contezza/dynamic-forms/shared';

/**
 * Placeholder triggering component creation. The resolved dynamic-form field is created as sibling of this component.
 */
@Component({
    standalone: true,
    selector: 'contezza-dynamic-form-field-creator',
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicFormFieldCreatorComponent implements OnInit {
    @Input()
    readonly field: ContezzaDynamicFormField;

    @Input()
    readonly control: FormControl;

    @Input()
    readonly component: Type<ContezzaBaseFieldComponentInterface>;

    constructor(private readonly container: ViewContainerRef) {}

    ngOnInit() {
        const componentRef = this.container.createComponent(this.component);
        Object.assign(componentRef.instance, this);
    }
}
