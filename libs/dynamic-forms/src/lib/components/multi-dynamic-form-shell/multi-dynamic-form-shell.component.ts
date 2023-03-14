import { AfterViewInit, ChangeDetectionStrategy, Component, Input, ViewChild } from '@angular/core';

import { combineLatest, Observable } from 'rxjs';
import { debounceTime, filter, map, tap } from 'rxjs/operators';

import { SelectionStore } from '@contezza/core/context';

import { DynamicFormItem, DynamicFormItemGroup } from '@contezza/dynamic-forms/shared';

import { MultiDynamicFormComponent } from '../multi-dynamic-form';

import { Settings, Step } from './interfaces';
import { MultiDynamicFormShellStore } from './multi-dynamic-form-shell.store';

@Component({
    selector: 'contezza-multi-dynamic-form-shell',
    templateUrl: './multi-dynamic-form-shell.component.html',
    styleUrls: ['./multi-dynamic-form-shell.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [SelectionStore, MultiDynamicFormShellStore],
})
export class MultiDynamicFormShellComponent implements AfterViewInit {
    @Input()
    set groups(value: DynamicFormItemGroup[]) {
        this.store.patchState({ groups: value });
        const items = value.map((group) => group.items).flat();
        this.items = items;
        this.selection.add(items.filter(({ selected }) => selected !== false));
    }

    items: DynamicFormItem[];

    @Input()
    set settings(settings: Settings) {
        this.store.patchState(settings);
    }

    readonly groups$ = this.store.groups$;

    readonly firstStep$ = this.store.firstStep$;
    readonly lastStep$ = this.store.lastStep$;

    readonly selection$ = this.selection.selection$;

    readonly expandedSelector$ = this.store.step$.pipe(map((step) => step === Step.Select));
    readonly canPrevious$ = this.firstStep$.pipe(map((value) => !value));
    readonly canNext$ = combineLatest([this.lastStep$.pipe(map((value) => !value)), this.selection$.pipe(map((selection) => selection.length > 0))]).pipe(
        map((values) => values.every(Boolean))
    );

    @ViewChild(MultiDynamicFormComponent)
    forms: MultiDynamicFormComponent;

    readonly activeItem$: Observable<DynamicFormItem> = combineLatest([
        this.store.activeItem$,
        this.selection.selection$.pipe(
            tap((selection) => this.store.enableForms(selection)),
            filter((selection) => !!selection?.length)
        ),
    ]).pipe(
        debounceTime(0),
        filter(([activeFile, selection]) => {
            if (selection.some((file) => file === activeFile)) {
                return true;
            } else {
                this.store.activateFile(selection[0]);
                return false;
            }
        }),
        map(([activeFile]) => activeFile)
    );
    readonly valid$ = this.store.valid$;
    readonly value$ = this.store.value$;

    constructor(private readonly selection: SelectionStore<DynamicFormItem>, private readonly store: MultiDynamicFormShellStore) {}

    ngAfterViewInit() {
        if (this.forms) {
            this.store.patchState({ forms: this.forms });
        }
    }

    previous() {
        this.store.previousStep();
    }

    next() {
        this.store.nextStep();
    }
}
