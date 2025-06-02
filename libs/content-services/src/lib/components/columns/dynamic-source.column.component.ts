import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Observable } from 'rxjs';

import { ContezzaDependenciesService, ContezzaDynamicSource, ContezzaDynamicSourceProcessorService } from '@contezza/core/extensions';

import { ColumnComponent } from '@contezza/content-services/shared';

type Data = ContezzaDynamicSource;

@Component({
    standalone: true,
    imports: [CommonModule],
    selector: 'contezza-dynamic-source-column',
    template: `{{ value$ | async }}`,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicSourceColumnComponent<TItem> extends ColumnComponent<TItem, Data> implements OnInit {
    value$!: Observable<unknown>;

    constructor(private readonly dependencies: ContezzaDependenciesService, private readonly sourceProcessor: ContezzaDynamicSourceProcessorService) {
        super();
    }

    ngOnInit() {
        const { item, column } = this;
        this.dependencies.init();
        this.value$ = this.sourceProcessor.processSource(column.data);
        const deps = this.dependencies.get();
        deps.find(({ key }) => key === 'item')?.next(item);
        deps.find(({ key }) => key === 'column')?.next(column);
    }
}
