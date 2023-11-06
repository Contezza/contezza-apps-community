import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormGroup } from '@angular/forms';

import { TranslateModule } from '@ngx-translate/core';

import { BehaviorSubject, Observable } from 'rxjs';
import { map, shareReplay, takeUntil } from 'rxjs/operators';

import { ContentActionRef, ContentActionType } from '@alfresco/adf-extensions';
import { SharedToolbarModule } from '@alfresco/aca-shared';

import { ContezzaLetModule } from '@contezza/core/directives';
import { DestroyService } from '@contezza/core/services';
import { ContezzaArrayUtils, ContezzaObservables } from '@contezza/core/utils';
import { ContezzaDynamicForm } from '@contezza/dynamic-forms/shared';

import { ContezzaDynamicFormService } from '../../../services';
import { ContezzaDynamicFormComponent } from '../../dynamic-form';
import { ContezzaBaseFieldComponent } from '../base-field.component';

@Component({
    selector: 'contezza-array-field',
    standalone: true,
    imports: [CommonModule, TranslateModule, SharedToolbarModule, ContezzaLetModule, ContezzaDynamicFormComponent],
    template: `<ng-container *contezzaLet="readonly$ | async as readonly">
        <div class="contezza-form-field contezza-array-form-field adf-property-field adf-card-textitem-field">
            <div class="mat-form-field-label mat-form-field-empty contezza-array-form-field-label" *ngIf="field.label">{{ field.label | translate }}</div>
            <div *ngIf="forms$ | async as forms" class="contezza-array-form-field-list">
                <ng-container *ngFor="let form of forms; trackBy: trackByKey">
                    <div class="contezza-array-form-field-list-item">
                        <contezza-dynamic-form [dynamicForm]="form.value"></contezza-dynamic-form>
                        <aca-toolbar-action *ngIf="!readonly" [actionRef]="deleteAction" (keydown.enter)="delete(form.key)" (click)="delete(form.key)"></aca-toolbar-action>
                    </div>
                </ng-container>
            </div>
            <aca-toolbar-action *ngIf="!readonly" [actionRef]="addAction" (keydown.enter)="add()" (click)="add()"></aca-toolbar-action>
        </div>
    </ng-container>`,
    styleUrls: ['./array.field.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArrayFieldComponent<TBaseValue> extends ContezzaBaseFieldComponent<TBaseValue, TBaseValue[]> implements OnInit {
    static readonly ACTION_ADD_ID = 'add';
    static readonly ACTION_ADD_DEFAULT: ContentActionRef = { id: ArrayFieldComponent.ACTION_ADD_ID, icon: 'add', type: ContentActionType.button };
    static readonly ACTION_DELETE_ID = 'delete';
    static readonly ACTION_DELETE_DEFAULT: ContentActionRef = { id: ArrayFieldComponent.ACTION_DELETE_ID, icon: 'delete', type: ContentActionType.button };

    settings: { formId: string; layoutId?: string; actions?: Partial<ContentActionRef>[] };
    dependencies: Record<string, Observable<any>>;

    addAction: ContentActionRef;
    deleteAction: ContentActionRef;

    private count = 0;

    private readonly subform = new FormGroup<Record<string, AbstractControl<TBaseValue>>>({});
    private readonly forms: Record<string, ContezzaDynamicForm> = {};
    private readonly formsSource = new BehaviorSubject<Record<string, ContezzaDynamicForm>>(this.forms);
    readonly forms$: Observable<{ key: string; value: ContezzaDynamicForm }[]> = this.formsSource
        .asObservable()
        .pipe(map((forms) => Object.entries(forms).map(([key, value]) => ({ key, value }))));

    constructor(private readonly dynamicFormService: ContezzaDynamicFormService, destroy$: DestroyService) {
        super(destroy$);
    }

    ngOnInit() {
        super.ngOnInit();
        this.settings = this.field.settings as any;
        this.dependencies = Object.entries(this.field.extras || {}).reduce((acc, [key, dep]) => {
            acc[key] = dep.pipe(shareReplay());
            return acc;
        }, {});

        this.addAction = { ...ArrayFieldComponent.ACTION_ADD_DEFAULT, ...(this.settings.actions?.find(({ id }) => id === ArrayFieldComponent.ACTION_ADD_ID) || {}) };
        this.deleteAction = { ...ArrayFieldComponent.ACTION_DELETE_DEFAULT, ...(this.settings.actions?.find(({ id }) => id === ArrayFieldComponent.ACTION_DELETE_ID) || {}) };

        // this.control is linked with the extern dynamic form, value type TBaseValue[]
        // this.subform is intern, value type Record<string, TBaseValue>
        // these two must be in sync

        const [subformValueChanges, controlValueChanges] = ContezzaObservables.crossFilter<TBaseValue[]>(
            this.subform.valueChanges.pipe(map((value) => Object.values(value))),
            this.control.valueChanges,
            (value1, value2) =>
                (value1 || value2) && (!value1 || !value2 || value1.length !== value2.length || ContezzaArrayUtils.range(value1.length).some((i) => value1[i] !== value2[i]))
        );

        // value intern -> extern
        subformValueChanges.pipe(takeUntil(this.destroy$)).subscribe((value) => {
            if (Object.values(this.subform.controls).some((control) => control.touched)) {
                this.control.markAsTouched();
            }
            this.control.setValue(value);
        });

        // value extern -> intern
        controlValueChanges.pipe(takeUntil(this.destroy$)).subscribe((value: TBaseValue[]) => {
            this.delete();
            value?.forEach((x) => this.add(x));
        });

        // status intern ->extern
        this.subform.statusChanges.pipe(takeUntil(this.destroy$)).subscribe((status) => this.control.setErrors(status === 'INVALID' ? { subform: status } : null));
    }

    add(value?: TBaseValue) {
        const form = this.dynamicFormService.get(this.settings.formId, this.settings.layoutId, true);
        form.provideDependencies(this.dependencies);
        form.build();

        if (value) {
            form.form.patchValue(value);
        }

        const id = this.generateId();
        this.forms[id] = form;
        this.subform.addControl(id, form.form);

        this.refreshForms();
    }

    delete(key?: string) {
        (key ? [key] : Object.keys(this.subform.controls)).forEach((k) => {
            delete this.forms[k];
            this.subform.removeControl(k);
        });

        this.refreshForms();
    }

    private refreshForms() {
        this.formsSource.next(this.forms);
    }

    private generateId(): string {
        this.count++;
        return '' + this.count;
    }

    trackByKey(_: number, { key }: { key: string }) {
        return key;
    }
}
