import { ComponentFactoryResolver, ComponentRef, Directive, Input, OnInit, ViewContainerRef } from '@angular/core';
import { FormControl } from '@angular/forms';

import { ContezzaDynamicFormExtensionService, ContezzaDynamicFormField } from '@contezza/dynamic-forms/shared';

@Directive({
    selector: '[contezzaDynamicFormField]',
})
export class DynamicFormFieldDirective implements OnInit {
    private componentRef: ComponentRef<any>;

    @Input()
    field: ContezzaDynamicFormField;

    @Input()
    control: FormControl;

    constructor(
        private readonly resolver: ComponentFactoryResolver,
        private readonly container: ViewContainerRef,
        private readonly extensions: ContezzaDynamicFormExtensionService
    ) {}

    ngOnInit() {
        if (this.field) {
            const factory = this.resolver.resolveComponentFactory(this.extensions.getFieldComponentById(this.field.type));

            this.componentRef = this.container.createComponent(factory);
            this.componentRef.instance.field = this.field;
            this.componentRef.instance.control = this.control;
        }
    }
}
