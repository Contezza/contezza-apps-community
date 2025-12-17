import { ChangeDetectionStrategy, Component, EventEmitter, Inject, Input, OnInit, Optional, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { TranslateModule } from '@ngx-translate/core';

import { takeUntil } from 'rxjs';

import { DestroyService } from '@contezza/core/services';
import { ContezzaDynamicSearchForm } from '@contezza/dynamic-forms/shared';

import { ContezzaDynamicFormFilterService } from '../../services';
import { ContezzaDynamicFormModule } from '../dynamic-form';

@Component({
    standalone: true,
    imports: [CommonModule, ContezzaDynamicFormModule, MatButtonModule, MatCardModule, MatIconModule, MatProgressBarModule, TranslateModule],
    selector: 'contezza-dynamic-form-filter',
    templateUrl: './dynamic-form-filter.component.html',
    styleUrls: ['./dynamic-form-filter.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [DestroyService],
})
export class ContezzaDynamicFormFilterComponent implements OnInit {
    @Input()
    dynamicForm: ContezzaDynamicSearchForm;

    @Input()
    loading: boolean;

    @Input()
    hideTitle: boolean;

    @Output() cleared = new EventEmitter<void>();

    constructor(@Optional() private readonly filterService: ContezzaDynamicFormFilterService, @Inject(DestroyService) readonly destroy$: DestroyService) {}

    ngOnInit(): void {
        if (!this.dynamicForm) {
            this.filterService.form.pipe(takeUntil(this.destroy$)).subscribe((dynamicForm) => (this.dynamicForm = dynamicForm));
        }
    }

    clearFilters() {
        this.dynamicForm.reset('default');
        this.cleared.emit();
    }

    searchClicked() {
        this.dynamicForm.trigger();
    }
}
