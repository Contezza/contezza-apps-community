import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { ContezzaDynamicForm, ContezzaDynamicFormLayout, DynamicFormDefinition, ExtendedDynamicFormDefinition } from '@contezza/dynamic-forms/shared';

import { ContezzaDynamicFormService } from '../../services';

/**
 * Displays a dynamic form.
 * Input can be either an already constructed ContezzaDynamicForm object or its definition (form id, layout id and dependencies).
 */
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
    @Input()
    dynamicFormId: ExtendedDynamicFormDefinition;

    @Input()
    dynamicForm: ContezzaDynamicForm;

    form: FormGroup;
    layout: ContezzaDynamicFormLayout;

    @Output()
    enterPressed = new EventEmitter();

    constructor(private readonly dynamicFormService: ContezzaDynamicFormService) {}

    ngOnInit() {
        // require dynamicForm or dynamicFormId to initialise
        if (!this.dynamicForm && !this.dynamicFormId) {
            throw new Error('No dynamic form or dynamic-form definition provided.');
        }

        // initialise dynamicForm from dynamicFormId
        if (this.dynamicFormId) {
            if (this.dynamicForm) {
                // if both are given, prioritise dynamicForm
                console.warn('Dynamic form and dynamic-form definition are both provided. Dynamic form is used.');
            } else {
                // resolve dynamic form from definition
                const def: DynamicFormDefinition = typeof this.dynamicFormId === 'string' ? { id: this.dynamicFormId } : this.dynamicFormId;
                this.dynamicForm = this.dynamicFormService.get(def.id, def.layoutId).provideDependencies(def.providedDependencies);
            }
        }

        this.dynamicForm.build();
        this.form = this.dynamicForm.form;
        this.layout = this.dynamicForm.layout;
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
