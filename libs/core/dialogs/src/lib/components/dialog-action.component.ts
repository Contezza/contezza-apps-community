import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { TranslatePipe } from '@ngx-translate/core';

import { ContezzaObservables } from '@contezza/core/utils';

import { DialogAction } from '../models';
import type { DialogComponent } from './dialog.component';

@Component({
    standalone: true,
    imports: [MatButtonModule, TranslatePipe],
    selector: 'contezza-dialog-action',
    template: `@if (action(); as action) {
        @switch (action.matType) {
            @case ('mat-raised-button') {
                <button mat-raised-button [id]="action.id" [color]="action.color" (click)="onClick()">{{ action.title | translate }}</button>
            }
            <!--@case ('mat-button')-->
            @default {
                <button mat-button [id]="action.id" [color]="action.color" (click)="onClick()">{{ action.title | translate }}</button>
            }
        }
    }`,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogActionComponent {
    // inputs
    readonly dialog = input.required<DialogComponent>();
    readonly action = input.required<DialogAction>();

    onClick() {
        const dialogRef = this.dialog().dialogRef;
        const contentComponent = this.dialog().contentComponent;
        const action = this.action();
        if (action.execute) {
            action.execute(contentComponent, dialogRef);
        } else if (action.getResponse) {
            ContezzaObservables.of(action.getResponse(contentComponent)).subscribe(response => dialogRef.close(response));
        } else {
            dialogRef.close();
        }
    }
}
