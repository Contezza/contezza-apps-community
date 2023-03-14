import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { BehaviorSubject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { DestroyService } from '@contezza/core/services';
import { ContezzaDynamicForm } from '@contezza/dynamic-forms/shared';

import { ContezzaBaseFieldComponent } from '../base-field.component';

@Component({
    selector: 'contezza-subform-field',
    templateUrl: './subform-field.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubformFieldComponent extends ContezzaBaseFieldComponent implements OnInit {
    subform: ContezzaDynamicForm;

    parent: FormGroup;

    private readonly subformLoadingSource = new BehaviorSubject<boolean>(true);
    readonly subformLoading$: Observable<boolean> = this.subformLoadingSource.asObservable();

    constructor(private readonly cd: ChangeDetectorRef, destroy$: DestroyService) {
        super(destroy$);
    }

    ngOnInit(): void {
        super.ngOnInit();

        this.parent = this.control.parent as FormGroup;
        if (this.parent.get(this.field.id)) {
            this.parent.removeControl(this.field.id);
        }

        this.field.extras.subfields
            .filterLoadingValues(this.subformLoadingSource)
            .pipe(takeUntil(this.destroy$))
            .subscribe((subform) => this.onSubformChange(subform));
    }

    private onSubformChange(subform: ContezzaDynamicForm) {
        subform.build();

        this.subform = undefined;
        // enforcing the reset of the dynamic form component
        this.cd.detectChanges();

        this.subform = subform;
        // updating the view, otherwise the form is not available
        this.cd.detectChanges();

        if (this.parent.get(this.field.id)) {
            this.parent.removeControl(this.field.id);
        }
        this.parent.addControl(this.field.id, this.subform.form);
    }
}
