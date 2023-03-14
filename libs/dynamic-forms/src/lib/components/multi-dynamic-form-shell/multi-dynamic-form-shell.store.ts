import { Injectable } from '@angular/core';

import { ComponentStore } from '@ngrx/component-store';

import { combineLatest, Observable } from 'rxjs';
import { filter, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { DynamicFormItem, DynamicFormItemGroup } from '@contezza/dynamic-forms/shared';

import { MultiDynamicFormComponent } from '../multi-dynamic-form';

import { Step } from './interfaces';

interface MultiDynamicFormState {
    readonly groups: DynamicFormItemGroup[];
    activeItem?: DynamicFormItem;
    readonly steps: Step[];
    stepIndex: number;
    forms?: MultiDynamicFormComponent;
}

@Injectable()
export class MultiDynamicFormShellStore extends ComponentStore<MultiDynamicFormState> {
    // selectors
    readonly groups$: Observable<MultiDynamicFormState['groups']> = this.select(({ groups }) => groups);
    private readonly steps$: Observable<MultiDynamicFormState['steps']> = this.select(({ steps }) => steps);
    private readonly stepIndex$: Observable<MultiDynamicFormState['stepIndex']> = this.select(({ stepIndex }) => stepIndex);
    readonly step$: Observable<Step> = this.select(this.steps$, this.stepIndex$, (steps, stepIndex) => steps[stepIndex]);

    readonly firstStep$: Observable<boolean> = this.select(this.stepIndex$, (stepIndex) => stepIndex === 0);
    readonly lastStep$: Observable<boolean> = this.select(this.steps$, this.stepIndex$, (steps, stepIndex) => stepIndex === steps.length - 1);

    readonly activeItem$: Observable<MultiDynamicFormState['activeItem']> = this.select(({ activeItem }) => activeItem);
    readonly active$ = (item: DynamicFormItem): Observable<boolean> => this.select(this.activeItem$, (activeItem) => activeItem === item);

    readonly forms$: Observable<MultiDynamicFormState['forms']> = this.select(({ forms }) => forms).pipe(filter((value) => !!value));
    readonly valid$: Observable<boolean> = combineLatest([this.lastStep$, this.forms$.pipe(switchMap((forms) => forms.valid$))]).pipe(map((values) => values.every(Boolean)));
    readonly value$: Observable<any> = this.forms$.pipe(switchMap((forms) => forms.value$));

    // reducers
    readonly previousStep = this.updater((state) => ({ ...state, stepIndex: state.stepIndex - 1 }));
    readonly nextStep = this.updater((state) => ({ ...state, stepIndex: state.stepIndex + 1 }));

    readonly activateFile = this.updater((state, activeItem: DynamicFormItem) => ({ ...state, activeItem }));

    // effects
    enableForms = this.effect((selection$: Observable<DynamicFormItem[]>) =>
        selection$.pipe(
            withLatestFrom(this.forms$),
            tap(([selection, forms]) => forms.enable(selection))
        )
    );
    runAction = this.effect((action$: Observable<{ type: string; target: DynamicFormItem }>) =>
        action$.pipe(
            withLatestFrom(this.forms$),
            tap(([action, forms]) => forms[action.type]?.(action.target))
        )
    );

    constructor() {
        super({ groups: [], steps: [], stepIndex: 0 });
    }
}
