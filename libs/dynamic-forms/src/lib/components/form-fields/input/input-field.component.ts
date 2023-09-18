import { ChangeDetectionStrategy, Component, OnInit, ViewChild } from '@angular/core';

import { DestroyService } from '@contezza/core/services';
import { MatInput } from '@angular/material/input';

import { ContezzaBaseFieldComponent } from '../base-field.component';

@Component({
    selector: 'contezza-input-field',
    templateUrl: './input-field.component.html',
    styleUrls: ['./input-field.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [DestroyService],
})
export class InputFieldComponent<ValueType extends string | number> extends ContezzaBaseFieldComponent<ValueType> implements OnInit {
    @ViewChild(MatInput)
    input: MatInput;

    inputType: 'number' | 'text';

    numberFieldConfig?: { min?: number; max?: number };

    ngOnInit(): void {
        super.ngOnInit();
        this.inputType = this.field.type === 'int' || this.field.type === 'integer' || this.field.type === 'long' ? 'number' : 'text';

        if (this.inputType === 'number') {
            this.initializeNumberFieldConfig();
        }
    }

    focusOnField(): void {
        this.input.focus();
    }

    protected initializeNumberFieldConfig() {
        this.numberFieldConfig = {};
        if (this.field.validations) {
            const minValidation = this.field.validations.find(({ id }) => id === 'min');
            if (minValidation) {
                this.numberFieldConfig.min = minValidation.parameters;
            }
            const maxValidation = this.field.validations.find(({ id }) => id === 'max');
            if (maxValidation) {
                this.numberFieldConfig.max = maxValidation.parameters;
            }
        }
    }

    onKeyDown(event: KeyboardEvent) {
        if ((this.field.type === 'int' || this.field.type === 'integer') && ['.', ',', 'e'].some((key) => key === event.key)) {
            event.preventDefault();
        }
    }
}
