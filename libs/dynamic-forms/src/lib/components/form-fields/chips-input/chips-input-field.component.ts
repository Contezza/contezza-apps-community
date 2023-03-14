import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

import { ContezzaBaseFieldComponent } from '../base-field.component';
import { MatChipInputEvent } from '@angular/material/chips';

@Component({
    selector: 'contezza-chips-input-field',
    templateUrl: './chips-input-field.component.html',
    styleUrls: ['./chips-input-field.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChipsInputFieldComponent extends ContezzaBaseFieldComponent<string, string[]> implements OnInit {
    readonly separatorKeysCodes = [ENTER, COMMA];
    selectable = true;
    removable = true;
    addOnBlur = true;

    add(event: MatChipInputEvent): void {
        const input = event.input;
        const value = event.value.trim();

        if (value && !this.control.value?.includes(value)) {
            this.control.setValue((this.control.value || []).concat([value]));
        }

        if (input) {
            input.value = '';
        }
    }

    remove(value: string): void {
        const index = this.control.value.indexOf(value);

        if (index >= 0) {
            const controlValueCopy = [...this.control.value];
            controlValueCopy.splice(index, 1);
            this.control.setValue(controlValueCopy.length ? controlValueCopy : null);
        }
    }
}
