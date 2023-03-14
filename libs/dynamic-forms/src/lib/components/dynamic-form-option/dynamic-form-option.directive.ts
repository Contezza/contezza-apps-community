import { ComponentFactoryResolver, ComponentRef, Directive, Input, OnInit, ViewContainerRef } from '@angular/core';

import { ContezzaDynamicFormExtensionService } from '@contezza/dynamic-forms/shared';

@Directive({
    selector: '[dynamicFormOption]',
})
export class DynamicFormOptionDirective implements OnInit {
    private componentRef: ComponentRef<any>;

    @Input()
    component: string;

    @Input()
    value: any;

    constructor(
        private readonly resolver: ComponentFactoryResolver,
        private readonly container: ViewContainerRef,
        private readonly extensions: ContezzaDynamicFormExtensionService
    ) {}

    ngOnInit() {
        if (this.component) {
            const factory = this.resolver.resolveComponentFactory(this.extensions.getOptionComponentById(this.component));
            this.componentRef = this.container.createComponent(factory);
            this.componentRef.instance.value = this.value;
        }
    }
}
