import { ChangeDetectionStrategy, Component, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl } from '@angular/forms';

import { BehaviorSubject, merge, Observable, Subject } from 'rxjs';
import { debounceTime, map, scan, startWith, switchMap, tap } from 'rxjs/operators';

import { ContentActionType } from '@alfresco/adf-extensions';
import { ToolbarActionComponent } from '@alfresco/aca-shared';

import { DestroyService } from '@contezza/core/services';
import { InputFieldComponent } from '@contezza/dynamic-forms';
import { ContezzaDynamicFormField } from '@contezza/dynamic-forms/shared';

@Component({
    standalone: true,
    imports: [CommonModule, ToolbarActionComponent, InputFieldComponent],
    selector: 'contezza-search-table-layout-header-search',
    template: `
        <ng-container *ngIf="control$ | async as control">
            <div class="contezza-search-table-layout-header-search-input" [class.expanded]="expanded$ | async">
                <contezza-input-field class="contezza-search-table-layout-header-search-input-field" [field]="field" [control]="control" />
                <ng-container *ngIf="!!control.value; else action">
                    <aca-toolbar-action [actionRef]="clearAction" (click)="control.reset()" />
                </ng-container>
            </div>
            <ng-container *ngTemplateOutlet="action" />
            <ng-template #action>
                <aca-toolbar-action [actionRef]="searchAction" (click)="toggle$.next()" />
            </ng-template>
        </ng-container>
    `,
    styleUrls: ['search.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'contezza-search-table-layout-header-search',
    },
    providers: [DestroyService],
})
export class SearchComponent {
    readonly field: ContezzaDynamicFormField<string, string> = { id: 'quick-search', type: 'input' };

    @Input()
    set control(control: FormControl<string>) {
        this.controlSource.next(control);
    }
    private readonly controlSource = new BehaviorSubject<FormControl<string>>(undefined);
    readonly control$ = this.controlSource.asObservable();

    readonly clearAction = { id: 'action', type: ContentActionType.default, icon: 'close' };
    readonly searchAction = { id: 'action', type: ContentActionType.default, icon: 'search' };

    readonly toggle$ = new Subject<void>();
    readonly expanded$: Observable<boolean> = merge(
        this.control$.pipe(switchMap((control) => control.valueChanges.pipe(startWith(control.value)))).pipe(
            debounceTime(700),
            map((value) => !!value)
        ),
        this.toggle$
    ).pipe(
        scan((acc, value) => (typeof value === 'boolean' ? value : !acc), false),
        tap((value) => {
            if (value && this.input) {
                this.input.focusOnField();
            }
        })
    );

    @ViewChild(InputFieldComponent)
    input: InputFieldComponent<string>;
}
