import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

import { Subject, switchMap } from 'rxjs';

import { MetadataInputResolver } from '@contezza/content-services/shared';

import { MetadataComponent } from './metadata.component';

@Component({
    standalone: true,
    imports: [MatProgressSpinner, MetadataComponent],
    selector: 'contezza-metadata-sidebar-tab',
    template: `@if (data(); as data) {
            <contezza-metadata [item]="data.item" [propertyDisplayListId]="data.propertyDisplayListId" [actionId]="data.actionId" />
        } @else {
            <div class="spinner-wrapper">
                <mat-progress-spinner mode="indeterminate" />
            </div>
        }`,
    styleUrls: ['metadata.sidebar-tab.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetadataSidebarTabComponent {
    // constructor
    private readonly resolver = inject(MetadataInputResolver);

    set node(value: Node) {
        this.nodeSource.next(value);
    }
    private readonly nodeSource = new Subject<Node>();
    private readonly data$ = this.nodeSource.pipe(switchMap(node => this.resolver.resolve(node)));
    readonly data = toSignal(this.data$);
}
