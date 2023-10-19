import { ChangeDetectionStrategy, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInput, MatInputModule } from '@angular/material/input';

import { TranslateModule } from '@ngx-translate/core';

import { InputMaskModule } from '@ngneat/input-mask';

import { DestroyService } from '@contezza/core/services';

import { ContezzaBaseFieldComponent } from '../base-field.component';
import { ContezzaDynamicFormsCommonModule } from '../../../dynamic-forms.common.module';

@Component({
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatIconModule, MatInputModule, TranslateModule, InputMaskModule, ContezzaDynamicFormsCommonModule],
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
