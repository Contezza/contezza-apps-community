import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { ContezzaDynamicForm, ContezzaDynamicFormField, ContezzaDynamicFormLayout } from '@contezza/dynamic-forms/shared';

import { ContezzaDynamicFormService } from '../../services';

@Component({
    selector: 'contezza-dynamic-form',
    template: `
        <form class="dynamic-form" [formGroup]="form" (keydown.enter)="onEnterPressed($event)">
            <ng-container *ngIf="layout && dynamicForm">
                <contezza-dynamic-subform [layout]="layout" [dynamicForm]="dynamicForm"></contezza-dynamic-subform>
            </ng-container>
        </form>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContezzaDynamicFormComponent implements OnInit, OnDestroy {
    form: FormGroup;

    @Input()
    dynamicFormId: string;

    @Input()
    providedDependencies: ContezzaDynamicForm['providedDependencies'];

    @Input()
    dynamicForm: ContezzaDynamicForm;

    @Input()
    fields: ContezzaDynamicFormField[];

    @Input()
    layout: ContezzaDynamicFormLayout;

    @Output()
    enterPressed = new EventEmitter();

    constructor(private readonly dynamicFormService: ContezzaDynamicFormService) {}

    ngOnInit() {
        if (!this.dynamicForm && this.dynamicFormId) {
            this.dynamicForm = this.dynamicFormService.get(this.dynamicFormId);
            if (this.providedDependencies) {
                this.dynamicForm.provideDependencies(this.providedDependencies);
            }
        }
        if (this.dynamicForm?.rootField?.subfields) {
            this.fields = this.dynamicForm?.rootField.subfields;
        }
        if (this.dynamicForm?.layout) {
            this.layout = this.dynamicForm?.layout;
        }
        this.dynamicForm.build();
        this.form = this.dynamicForm.form;
    }

    ngOnDestroy() {
        this.dynamicForm.destroy();
    }

    onEnterPressed(event) {
        // filter out 'enter pressed' event from autocomplete suggestions menu
        if (!event.defaultPrevented) {
            event.preventDefault();
            if (this.dynamicForm.form?.invalid) {
                this.dynamicForm.markInvalidFields();
            }
            this.enterPressed.emit(event);
        }
    }
}
