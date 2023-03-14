import { ChangeDetectionStrategy, Component, Inject, Input, OnInit, Optional } from '@angular/core';

import { takeUntil } from 'rxjs/operators';

import { DestroyService } from '@contezza/core/services';
import { ContezzaDynamicForm } from '@contezza/dynamic-forms/shared';

import { ContezzaDynamicFormFilterService } from '../../services';

@Component({
    selector: 'contezza-dynamic-form-filter',
    templateUrl: './dynamic-form-filter.component.html',
    styleUrls: ['./dynamic-form-filter.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [DestroyService],
})
export class ContezzaDynamicFormFilterComponent implements OnInit {
    @Input()
    dynamicForm: ContezzaDynamicForm;

    @Input()
    loading: boolean;

    @Input()
    hideTitle: boolean;

    constructor(@Optional() private readonly filterService: ContezzaDynamicFormFilterService, @Inject(DestroyService) readonly destroy$: DestroyService) {}

    ngOnInit(): void {
        if (!this.dynamicForm) {
            this.filterService.form.pipe(takeUntil(this.destroy$)).subscribe((dynamicForm) => (this.dynamicForm = dynamicForm));
        }
    }

    clearFilters() {
        this.dynamicForm.reset('default');
    }
}
