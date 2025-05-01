import { ChangeDetectionStrategy, Component, Inject, OnInit, Optional } from '@angular/core';

import { Observable, of } from 'rxjs';

import { ContezzaDynamicForm, DYNAMIC_FORM_DEPENDENCIES, ExtendedDynamicFormId } from '@contezza/dynamic-forms/shared';
import { ContezzaDynamicFormComponent, ContezzaDynamicFormService } from '@contezza/dynamic-forms';
import { ColumnComponent } from '@contezza/content-services/shared';

interface Data {
    formId: ExtendedDynamicFormId;
    itemAlias?: string;
}

@Component({
    standalone: true,
    imports: [ContezzaDynamicFormComponent],
    selector: 'contezza-dynamic-form-column',
    template: `<contezza-dynamic-form [dynamicForm]="form"></contezza-dynamic-form>`,
    styles: [
        `
            :host contezza-dynamic-form {
                pointer-events: none;
            }
        `,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicFormColumnComponent<TItem> extends ColumnComponent<TItem, Data> implements OnInit {
    form!: ContezzaDynamicForm;

    constructor(private readonly df: ContezzaDynamicFormService, @Optional() @Inject(DYNAMIC_FORM_DEPENDENCIES) private readonly dependencies?: Record<string, Observable<any>>) {
        super();
    }

    ngOnInit() {
        const { item, column } = this;
        const formId = column.data.formId;
        const itemAlias = column.data.itemAlias;
        this.form = this.df.get(formId, true).provideDependencies({ ...this.dependencies, [itemAlias || 'item']: of(item) });
    }
}
