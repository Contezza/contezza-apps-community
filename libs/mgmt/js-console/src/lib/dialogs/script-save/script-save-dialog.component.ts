import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormControl, Validators } from '@angular/forms';

import { DestroyService } from '@contezza/common';
import { JsConsoleScriptSaveDialogService } from './script-save-dialog.service';

@Component({
    selector: 'js-console-script-save-dialog',
    templateUrl: './script-save-dialog.component.html',
    styleUrls: ['./script-save-dialog.component.scss'],
    encapsulation: ViewEncapsulation.None,
    providers: [DestroyService],
})
export class JsConsoleScriptSaveDialogComponent implements OnInit {
    scriptNameInput = new FormControl('', [Validators.required]);

    constructor(
        private readonly scriptSaveDialogService: JsConsoleScriptSaveDialogService,
        private readonly dialogRef: MatDialogRef<JsConsoleScriptSaveDialogComponent>,
        @Inject(MAT_DIALOG_DATA) readonly data: any
    ) {
        const { title, scripts } = this.data;

        if (title) {
            this.scriptNameInput.setValue(this.scriptSaveDialogService.getDuplicateTitle(title, scripts));
        }
    }

    ngOnInit(): void {
        // TODO: Check existed node on input
        // this.scriptNameInput.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value) => {
        //     console.log(value);
        // });
    }

    onEnterPressed(event: Event): void {
        if (!event.defaultPrevented) {
            event.preventDefault();
            this.onSubmit();
        }
    }

    onSubmit(): void {
        if (!this.scriptNameInput?.invalid) {
            this.dialogRef.close({
                name: this.scriptNameInput.value,
            });
        } else {
            this.scriptNameInput.updateValueAndValidity();
        }
    }
}
