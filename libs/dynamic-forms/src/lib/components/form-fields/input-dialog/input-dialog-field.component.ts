import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';

import { filter, startWith, takeUntil } from 'rxjs/operators';

import { ContezzaBaseFieldComponent } from '../base-field.component';

@Component({
    selector: 'contezza-input-dialog-field',
    templateUrl: './input-dialog-field.component.html',
    styleUrls: ['./input-dialog-field.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class InputDialogFieldComponent<ValueType> extends ContezzaBaseFieldComponent<ValueType> implements OnInit {
    subcontrol: FormControl;

    ngOnInit(): void {
        super.ngOnInit();
        this.subcontrol = new FormControl({ value: undefined, disabled: true });
        this.control.valueChanges
            .pipe(
                startWith(this.control.value),
                filter(() => this.control.valid),
                takeUntil(this.destroy$)
            )
            .subscribe((value) => this.subcontrol.setValue(this.field.dialog.display(value)?.contezzaDisplay.value.label));
    }

    openDialog() {
        this.field.dialog.afterClosed.subscribe((value) => {
            if (value) {
                this.control.setValue(value);
            }
        });
    }
}
