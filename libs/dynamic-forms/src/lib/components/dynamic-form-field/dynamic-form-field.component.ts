import { ChangeDetectionStrategy, Component, Input, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { FormControl } from '@angular/forms';

import { DestroyService } from '@contezza/core/services';
import { ContezzaDynamicFormExtensionService, ContezzaDynamicFormField } from '@contezza/dynamic-forms/shared';

@Component({
    standalone: true,
    selector: 'contezza-dynamic-form-field',
    template: `<div #content></div>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [DestroyService],
})
export class DynamicFormFieldComponent implements OnInit {
    @Input()
    readonly field: ContezzaDynamicFormField;

    @Input()
    readonly control: FormControl;

    @ViewChild('content', { read: ViewContainerRef, static: true })
    container: ViewContainerRef;

    constructor(private readonly extensions: ContezzaDynamicFormExtensionService) {}

    ngOnInit() {
        const component = this.extensions.getFieldComponentById(this.field.type);
        if (!component) {
            throw new Error('Unknown dynamic-form type: ' + this.field.type);
        }
        const componentRef = this.container.createComponent(component);
        Object.assign(componentRef.instance, this);
    }
}
