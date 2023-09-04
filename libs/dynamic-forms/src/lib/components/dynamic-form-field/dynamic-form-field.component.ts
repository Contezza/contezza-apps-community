import { ChangeDetectionStrategy, Component, Input, OnInit, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl } from '@angular/forms';

import { BehaviorSubject } from 'rxjs';

import { DestroyService } from '@contezza/core/services';
import { ContezzaBaseFieldComponentInterface, ContezzaDynamicFormExtensionService, ContezzaDynamicFormField } from '@contezza/dynamic-forms/shared';

import { DynamicFormFieldCreatorComponent } from './dynamic-form-field-creator.component';

/**
 * Base dynamic-form field component. Resolves the field component and instantiates the creator component.
 *
 */
@Component({
    standalone: true,
    imports: [CommonModule, DynamicFormFieldCreatorComponent],
    selector: 'contezza-dynamic-form-field',
    template: `<ng-container *ngIf="component$ | async as component">
        <contezza-dynamic-form-field-creator [field]="field" [control]="control" [component]="component"></contezza-dynamic-form-field-creator>
    </ng-container>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [DestroyService],
})
export class DynamicFormFieldComponent implements OnInit {
    @Input()
    readonly field: ContezzaDynamicFormField;

    @Input()
    readonly control: FormControl;

    private readonly componentSource = new BehaviorSubject<Type<ContezzaBaseFieldComponentInterface>>(undefined);
    readonly component$ = this.componentSource.asObservable();

    constructor(private readonly extensions: ContezzaDynamicFormExtensionService) {}

    ngOnInit() {
        this.extensions.getFieldComponentById(this.field.type).subscribe((component) => this.componentSource.next(component));
    }
}
