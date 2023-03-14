import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';

import { BehaviorSubject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { DestroyService } from '@contezza/core/services';
import { ContezzaDynamicFormField } from '@contezza/dynamic-forms/shared';

import { ContezzaBaseFieldComponent } from '../base-field.component';

export interface DynamicFieldChangePayload {
    field: Partial<ContezzaDynamicFormField>;
    conversionFunction?: (value: any, oldType: string, newType: string) => any;
}

@Component({
    selector: 'contezza-dynamic-field',
    templateUrl: './dynamic-field.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicFieldComponent extends ContezzaBaseFieldComponent implements OnInit {
    dynamicField: ContezzaDynamicFormField;

    private readonly fieldLoadingSource = new BehaviorSubject<boolean>(true);
    readonly fieldLoading$: Observable<boolean> = this.fieldLoadingSource.asObservable();

    constructor(private readonly cd: ChangeDetectorRef, destroy$: DestroyService) {
        super(destroy$);
    }

    ngOnInit(): void {
        super.ngOnInit();

        this.field.extras.field
            .filterLoadingValues(this.fieldLoadingSource)
            .pipe(takeUntil(this.destroy$))
            .subscribe((payload: DynamicFieldChangePayload) => this.onFieldChange(payload));
    }

    private onFieldChange({ field, conversionFunction }: DynamicFieldChangePayload) {
        const oldType = this.dynamicField?.type;
        const oldValue = this.control.value;

        this.dynamicField = undefined;
        // enforcing the reset of the dynamic form component
        this.cd.detectChanges();

        this.dynamicField = { ...this.field, ...field };

        const newType = this.dynamicField?.type;

        this.cd.detectChanges();

        let newValue;
        if (conversionFunction && (!oldType || (oldType !== newType && oldValue))) {
            newValue = conversionFunction(oldValue, oldType, newType);
        } else {
            newValue = oldValue;
        }
        this.control.reset(newValue);
    }
}
