import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { ContezzaLetModule } from '@contezza/core/directives';
import { ContezzaDynamicFormModule, ContezzaDynamicFormService } from '@contezza/dynamic-forms';
import { DynamicFormDialogService, MultiDynamicFormDialogService } from '@contezza/dynamic-forms/dialog';
import { ContezzaDynamicForm } from '@contezza/dynamic-forms/shared';
import { ExtensionService } from '@alfresco/adf-extensions';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { take } from 'rxjs';

@Component({
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatIconModule, ContezzaLetModule, ContezzaDynamicFormModule, MatToolbarModule, MatCardModule],
    selector: 'app-demo-dynamic-forms',
    template: `<ng-container>
        <mat-toolbar>
            <span>Demo dynamic-forms</span>
            <span class="toolbar-spacer"></span>
            <button #button mat-raised-button (click)="openDialog()"><mat-icon>refresh</mat-icon><span>Open form dialog</span></button>
            <button #button mat-raised-button (click)="openMultiDialog()"><mat-icon>refresh</mat-icon><span>Open multiform dialog</span></button>
        </mat-toolbar>
        <ng-container>
            <mat-card>
                <mat-card-content>
                    <contezza-dynamic-form class="demo-dynamic-form" [dynamicForm]="dynamicForm" />
                </mat-card-content>
                <mat-card-actions>
                    <button mat-raised-button [disabled]="!(dynamicForm.valid$ | async)" (click)="logFormValue()">Check</button>
                </mat-card-actions>
            </mat-card>
        </ng-container>
    </ng-container>`,
    styles: [
        `
            .toolbar-spacer {
                flex: 1;
            }

            .demo-dynamic-form {
                width: 200px;
            }
        `,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemoDynamicFormsComponent {
    // fill in these properties when developing a specific form
    static readonly FORM_ID = 'demo-app.dynamic-forms.all-field-types';
    static readonly FORM_LAYOUT_ID = 'default';

    static readonly DIALOG_FORM_ID = 'demo-app.dynamic-forms.test-dialog';
    static readonly DIALOG_FORM_LAYOUT_ID = 'default';

    static readonly DIALOG_MULTI_FORM_ID = 'demo-app.dynamic-forms.document-upload-object';
    static readonly DIALOG_MULTI_FORM_LAYOUT_ID = 'default';
    static readonly DIALOG_MULTI_FORM_COLUMNS_ID = 'demo-app.columns.document-upload';
    static readonly DIALOG_MULTI_FORM_COUNT = 4;

    readonly dynamicForm: ContezzaDynamicForm = this.dfs.get(DemoDynamicFormsComponent.FORM_ID, DemoDynamicFormsComponent.FORM_LAYOUT_ID).build();

    constructor(
        private readonly dfs: ContezzaDynamicFormService,
        private readonly dialog: DynamicFormDialogService,
        private readonly multiDfDialog: MultiDynamicFormDialogService,
        private readonly extensions: ExtensionService
    ) {}

    openDialog() {
        this.dialog
            .open({
                data: {
                    title: 'Dynamic-form dialog',
                    dynamicFormId: { id: DemoDynamicFormsComponent.DIALOG_FORM_ID, layoutId: DemoDynamicFormsComponent.DIALOG_FORM_LAYOUT_ID },
                    buttons: { submit: 'OK', cancel: 'NOPE' },
                },
            })
            .subscribe((response) => console.log(response));
    }

    openMultiDialog() {
        this.multiDfDialog
            .open({
                data: {
                    title: 'Multi dynamic-form dialog',
                    columns: this.extensions.getFeature('columns')?.find(({ id }) => id === DemoDynamicFormsComponent.DIALOG_MULTI_FORM_COLUMNS_ID)?.columns,
                    items: this.getPdfItems(),
                    buttons: { cancel: 'Cancel', submit: 'Ok' },
                },
                width: '90%',
            })
            .subscribe((response) => {
                console.log(response);
            });
    }

    logFormValue() {
        this.dynamicForm.value$.pipe(take(1)).subscribe((val) => console.log(val));
    }

    private getPdfItems() {
        const items = [];

        for (let i = 1; i <= DemoDynamicFormsComponent.DIALOG_MULTI_FORM_COUNT; i++) {
            const name = `Testnaam${i > 1 ? i : ''}`;
            items.push({
                name,
                file: {
                    type: 'pdf',
                },
                formId: DemoDynamicFormsComponent.DIALOG_MULTI_FORM_ID,
                layoutId: DemoDynamicFormsComponent.DIALOG_MULTI_FORM_LAYOUT_ID,
                id: name,
                thumbnail: 'pdf',
            });
        }

        return items;
    }
}
