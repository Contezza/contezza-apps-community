import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { BehaviorSubject, Observable, Subscription, takeUntil } from 'rxjs';

import { ContezzaDynamicForm } from '@contezza/dynamic-forms/shared';

import { ContezzaDynamicFormComponent } from '../../dynamic-form';
import { ContezzaBaseFieldComponent } from '../base-field.component';

@Component({
    standalone: true,
    imports: [CommonModule, ContezzaDynamicFormComponent, MatProgressSpinnerModule],
    selector: 'contezza-subform-field',
    templateUrl: './subform.field.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubformFieldComponent extends ContezzaBaseFieldComponent implements OnInit {
    static FORM_CONTROL_NAME = 'innerFormControl';

    subform: ContezzaDynamicForm;
    valueChangesSubscription: Subscription;

    parent: FormGroup;

    private readonly subformLoadingSource = new BehaviorSubject<boolean>(true);
    readonly subformLoading$: Observable<boolean> = this.subformLoadingSource.asObservable();

    // constructor
    private readonly cd = inject(ChangeDetectorRef);

    ngOnInit(): void {
        super.ngOnInit();

        this.parent = this.control.parent as FormGroup;
        if (this.parent.get(SubformFieldComponent.FORM_CONTROL_NAME)) {
            this.parent.removeControl(SubformFieldComponent.FORM_CONTROL_NAME);
        }

        this.field.extras.subfields
            .filterLoadingValues(this.subformLoadingSource)
            .pipe(takeUntil(this.destroy$))
            .subscribe((subform) => this.onSubformChange(subform));
    }

    private onSubformChange(subform: ContezzaDynamicForm) {
        subform.build();

        // remove old subform
        this.subform = undefined;
        this.valueChangesSubscription?.unsubscribe();
        // enforcing the reset of the dynamic form component
        this.cd.detectChanges();

        // activate new subform
        this.subform = subform;
        // updating the view, otherwise the form is not available
        this.cd.detectChanges();

        // remove old control
        if (this.parent.get(SubformFieldComponent.FORM_CONTROL_NAME)) {
            this.parent.removeControl(SubformFieldComponent.FORM_CONTROL_NAME);
        }
        // add new control so that its validity is applied
        this.parent.addControl(SubformFieldComponent.FORM_CONTROL_NAME, this.subform.form);

        // sync this.control.value with this.subform.form.value
        this.valueChangesSubscription = this.subform.form.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value) => this.control.setValue(value));
        this.control.setValue(this.subform.form.value);
    }
}
