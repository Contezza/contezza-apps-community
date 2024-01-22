import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl } from '@angular/forms';

import { defer, of, switchMap } from 'rxjs';

import { DestroyService } from '@contezza/core/services';
import { ContezzaDynamicFormExtensionService, ContezzaDynamicFormField } from '@contezza/dynamic-forms/shared';

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
export class DynamicFormFieldComponent {
    @Input()
    readonly field: ContezzaDynamicFormField;

    @Input()
    readonly control: FormControl;

    readonly component$ = defer(() => of(this.field.type)).pipe(switchMap((id) => this.extensions.getFieldComponentById(id)));

    constructor(private readonly extensions: ContezzaDynamicFormExtensionService) {}
}
