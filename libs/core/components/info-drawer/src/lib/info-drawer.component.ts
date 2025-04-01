import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { map, ReplaySubject, tap, withLatestFrom } from 'rxjs';

import { Node } from '@alfresco/js-api';
import { InfoDrawerModule } from '@alfresco/adf-core';
import { ExtensionsModule, SidebarTabRef } from '@alfresco/adf-extensions';
import { AppExtensionService, ToolbarComponent } from '@alfresco/aca-shared';

import { DetectChangesDirective, ReloadOnChangeOfDirective } from '@contezza/core/directives';
import { DynamicComponent, IsDefinedPipe } from '@contezza/core/dynamic-component';

@Component({
    standalone: true,
    imports: [CommonModule, InfoDrawerModule, ExtensionsModule, ToolbarComponent, DetectChangesDirective, ReloadOnChangeOfDirective, DynamicComponent, IsDefinedPipe],
    selector: 'contezza-info-drawer',
    templateUrl: 'info-drawer.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfoDrawerComponent {
    @Input()
    set node(node: Node) {
        this.nodeSource.next(node);
    }
    private readonly nodeSource = new ReplaySubject<Node>();
    readonly node$ = this.nodeSource.asObservable();

    readonly model$ = this.node$.pipe(
        tap((node) => {
            this.extensions.selection = {
                count: 1,
                nodes: [{ entry: node }],
                libraries: [],
                isEmpty: false,
                first: { entry: node },
                last: { entry: node },
                folder: { entry: node },
            };
        }),
        withLatestFrom(this.extensions.getAllowedSidebarActions()),
        map(([node, actions]) => ({
            node,
            actions,
            tabs: this.extensions.getSidebarTabs() as (SidebarTabRef & { data?: any })[],
        }))
    );

    constructor(private readonly extensions: AppExtensionService) {}
}
