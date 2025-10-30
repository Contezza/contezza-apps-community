import { ChangeDetectionStrategy, Component, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Observable } from 'rxjs';

import { ContezzaDependenciesService, ContezzaDependency, ContezzaDynamicSource, ContezzaDynamicSourceProcessorService } from '@contezza/core/extensions';

import { ColumnComponentV2 } from '@contezza/content-services/shared';

type Data = ContezzaDynamicSource;

@Component({
    standalone: true,
    imports: [CommonModule],
    selector: 'contezza-dynamic-source-column',
    template: `{{ value$ | async }}`,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicSourceColumnComponent<TItem> extends ColumnComponentV2<TItem, Data> implements OnInit {
    value$!: Observable<unknown>;

    private item$: ContezzaDependency;
    private column$: ContezzaDependency;

    constructor(private readonly dependencies: ContezzaDependenciesService, private readonly sourceProcessor: ContezzaDynamicSourceProcessorService) {
        super();

        // bind dynamic-source dependencies with component inputs
        // N.B.:
        // effects must be placed in injection context such as constructor
        // this works because effects are always first triggered after ngOnInit
        effect(() => {
            const value = this.column();
            this.column$?.next(value);
        });
        effect(() => {
            const value = this.item();
            this.item$?.next(value);
        });
    }

    ngOnInit() {
        const columnData = this.column().data;
        // process dynamic source to initialise value
        this.dependencies.init();
        this.value$ = this.sourceProcessor.processSource(columnData);
        // save dependencies as component properties
        const deps = this.dependencies.get();
        this.item$ = deps.find(({ key }) => key === 'item');
        this.column$ = deps.find(({ key }) => key === 'column');
    }
}
