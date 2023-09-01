import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
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

    constructor(private readonly cd: ChangeDetectorRef, private readonly extensions: ContezzaDynamicFormExtensionService) {}

    ngOnInit() {
        this.extensions.getFieldComponentById(this.field.type).subscribe((c) => {
            const componentRef = this.container.createComponent(c);
            Object.assign(componentRef.instance, this);
            this.cd.detectChanges();
        });
    }
}
