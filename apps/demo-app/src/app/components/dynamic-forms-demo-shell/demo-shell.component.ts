import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { BehaviorSubject, Observable, of } from 'rxjs';

import { ContezzaLetModule } from '@contezza/core/directives';
import { ContezzaDynamicFormModule, ContezzaDynamicFormService } from '@contezza/dynamic-forms';
import { DynamicFormDialogService, MultiDynamicFormDialogService } from '@contezza/dynamic-forms/dialog';
import { ContezzaDynamicForm } from '@contezza/dynamic-forms/shared';

import { ContezzaDynamicSourceLoaderService } from './dynamic-source-loader.service';
import { ExtensionService } from '@alfresco/adf-extensions';

interface FormValue {
    formId: string;
    layoutId?: string;
    style?: string;
}

@Component({
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatIconModule, ContezzaLetModule, ContezzaDynamicFormModule],
    selector: 'app-dynamic-forms-demo-shell',
    template: `<ng-container *contezzaLet="headerForm.valid | async as valid">
        <div class="header">
            <contezza-dynamic-form [dynamicForm]="headerForm" (keydown.enter)="$event.preventDefault(); button._getHostElement().click()"></contezza-dynamic-form>
            <ng-container>
                <div>
                    <span> {{ formExists ? 'The form exists!' : "This form doesn't exist" }}</span>
                </div>
            </ng-container>
            <div>
                <button #button mat-icon-button [disabled]="!valid" (click)="refresh(headerForm.form.value)"><mat-icon>refresh</mat-icon></button>
                <button #button mat-icon-button [disabled]="!valid" (click)="showDialog(headerForm.form.value)"><mat-icon>expand_more</mat-icon></button>
                <button #button mat-icon-button (click)="showMultiDialog()"><mat-icon>face</mat-icon></button>
                <button #button mat-icon-button [disabled]="!form" (click)="log(form)"><mat-icon>info</mat-icon></button>
            </div>
        </div>
        <ng-container *ngIf="(showForm$ | async) && valid">
            <div class="content">
                <contezza-dynamic-form [dynamicForm]="form" [style]="style"></contezza-dynamic-form>
            </div>
        </ng-container>
    </ng-container>`,
    styleUrls: ['./demo-shell.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemoShellComponent implements AfterViewInit {
    // fill in these properties when developing a specific form
    private readonly formId?: string;
    private readonly layoutId?: string;
    style?: string;

    readonly headerForm = this.service.get('demo-shell');

    private readonly showFormSource = new BehaviorSubject<boolean>(false);
    readonly showForm$ = this.showFormSource.asObservable();

    form: ContezzaDynamicForm;
    formExists: boolean = false;

    constructor(
        private readonly cd: ChangeDetectorRef,
        private readonly service: ContezzaDynamicFormService,
        private readonly dialog: DynamicFormDialogService,
        private readonly multiDfDialog: MultiDynamicFormDialogService,
        private readonly extensions: ExtensionService,
        // default sources are loaded in the constructor
        // add more if needed
        loader: ContezzaDynamicSourceLoaderService
    ) {
        this.headerForm.provideDependencies({ form: of({ formId: this.formId, layoutId: this.layoutId, style: this.style }) });
        this.headerForm.build();
    }

    ngAfterViewInit() {
        setTimeout(() => {
            if (this.headerForm.form.status === 'VALID') {
                this.refresh(this.headerForm.form.value);
            }
        }, 500);
    }

    refresh(value: FormValue) {
        this.showFormSource.next(false);

        this.formExists = this.service.has(value.formId, value.layoutId);
        this.form = this.service.get(value.formId, value.layoutId || undefined);

        const providedDependencies: Record<string, Observable<any>> = {};
        this.form.provideDependencies(providedDependencies);
        this.style = value.style;
        this.cd.detectChanges();
        this.showFormSource.next(true);
        this.cd.detectChanges();
        this.form.value$.subscribe((val) => {
            console.warn(val);
        });
        this.form.format('query').subscribe((val) => {
            console.warn(val);
        });
    }

    showDialog(value: FormValue) {
        this.dialog
            .open({
                data: {
                    title: {
                        label: 'Test dialog',
                        tooltip: 'test tooltip',
                    },
                    dynamicFormId: { id: value.formId, layoutId: value.layoutId },
                    buttons: { submit: 'OK', cancel: 'NOPE' },
                },
            })
            .subscribe((response) => console.log(response));
    }

    showMultiDialog() {
        const nodes = [
            {
                name: 'Testnaam',
                file: {
                    type: 'pdf',
                },
                formId: 'tezza.document-upload.dynamic-forms.object',
            },
            {
                name: 'Testnaam2',
                file: {
                    type: 'pdf',
                },
                formId: 'tezza.document-upload.dynamic-forms.object2',
            },
        ];
        const items = [];
        const columns = this.extensions.getFeature('columns')?.find(({ id }) => id === 'tezza.document-upload.columns.document')?.columns;
        nodes.forEach((node) => {
            items.push({
                ...node,
                id: node.name,
                thumbnail: node.file.type,
                formId: node.formId,
            });
        });

        this.multiDfDialog
            .open({
                data: {
                    title: 'Titel',
                    columns,
                    items,
                    buttons: { cancel: 'Cancel', submit: 'Ok' },
                },
                width: '90%',
            })
            .subscribe((resonse) => {
                console.log(resonse);
            });
    }

    log(form) {
        console.log(form);
    }
}
