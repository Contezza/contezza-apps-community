import { ChangeDetectionStrategy, Component, EventEmitter, HostBinding, Input, Optional, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl } from '@angular/forms';

import { TranslateModule } from '@ngx-translate/core';

import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { map, switchMap, takeUntil, tap } from 'rxjs/operators';

import { Node, PathElement } from '@alfresco/js-api';
import { BreadcrumbComponent, BreadcrumbModule } from '@alfresco/adf-content-services';

import { ContezzaLetModule } from '@contezza/core/directives';
import { ContezzaDynamicSourceProcessorService } from '@contezza/core/extensions';
import { DestroyService, SiteTitlesService } from '@contezza/core/services';
import { ContezzaArrayUtils } from '@contezza/core/utils';
import { ResponsiveService } from '@contezza/core/responsive';
import { NavigationActionComponent } from '@contezza/core/responsive/components/navigation-action';
import { TableLayoutSettings } from '@contezza/content-services/search/shared';

import { ToolbarComponent } from '@contezza/core/context';
import { SearchComponent } from './search/search.component';

interface View {
    action: NavigationActionComponent['action'];
    breadcrumb?: Pick<BreadcrumbComponent, 'folderNode' | 'rootId' | 'root'>;
}

@Component({
    standalone: true,
    imports: [CommonModule, TranslateModule, BreadcrumbModule, ContezzaLetModule, NavigationActionComponent, ToolbarComponent, SearchComponent],
    selector: 'contezza-search-table-layout-header',
    template: `<ng-container *ngIf="view$ | async as view">
        <contezza-responsive-navigation-action *ngIf="showMenuAction" [action]="view.action" />
        <div class="contezza-search-table-layout-header-title">
            <ng-container *ngIf="view.breadcrumb as breadcrumb; else onlyTitle">
                <adf-breadcrumb
                    [folderNode]="breadcrumb.folderNode"
                    [rootId]="breadcrumb.rootId"
                    [root]="breadcrumb.root"
                    (navigate)="onBreadcrumbNavigate($event, breadcrumb.folderNode)"
                />
            </ng-container>
            <ng-template #onlyTitle>{{ title | translate }}</ng-template>
        </div>
        <ng-container *ngIf="searchControl">
            <contezza-search-table-layout-header-search [control]="searchControl" />
        </ng-container>
        <contezza-toolbar [key]="toolbarKey" />
    </ng-container>`,
    styleUrls: ['header.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'contezza-search-table-layout-header',
    },
    providers: [DestroyService],
})
export class HeaderComponent {
    @Input()
    title: string;

    @Input()
    showBreadcrumb?: boolean;

    @Input()
    showMenuAction = true;

    @Input()
    set currentFolder(node: Node | undefined) {
        this.currentFolderSource.next(node);
    }

    private readonly currentFolderSource = new BehaviorSubject<Node | undefined>(undefined);
    readonly currentFolder$: Observable<Node | undefined> = this.currentFolderSource.asObservable().pipe(switchMap((node) => (node ? this.makeBreadcrumbData(node) : of(node))));

    @Input()
    rootFolderRule?: string;

    @Input()
    set root(root: TableLayoutSettings['breadcrumbTitle']) {
        this.rootSource.next(root);
    }
    private readonly rootSource = new BehaviorSubject<TableLayoutSettings['breadcrumbTitle']>(undefined);
    readonly root$: Observable<string | undefined> = this.rootSource.pipe(
        switchMap((root) => (typeof root === 'string' ? of(root) : root ? this.dynamicSourceProcessor.processSource<string>(root) : of(undefined)))
    );

    @Input()
    toolbarKey?: string;

    @Input()
    searchControl?: FormControl<string>;

    private readonly breadcrumbNavigateSource = new EventEmitter<[PathElement, Node]>();
    @Output()
    readonly breadcrumbNavigate: Observable<Node> = this.breadcrumbNavigateSource.asObservable().pipe(
        map(([targetNode, folderNode]) => {
            // complete targetNode with path information from folderNode
            const entry = targetNode as Node;
            entry.isFolder = true;
            entry.isFile = false;
            const pathElements = folderNode.path.elements;
            const index = pathElements.findIndex(({ id }) => id === targetNode.id);
            if (index > -1) {
                entry.path = { elements: pathElements.slice(0, index) };
            }
            return entry;
        })
    );

    @Output()
    readonly search = new EventEmitter<string>();

    @HostBinding('class.mobile')
    isMobile = false;

    readonly view$: Observable<View> = combineLatest([
        this.currentFolder$.pipe(
            map((currentFolder) => {
                const rootId =
                    currentFolder && this.rootFolderRule
                        ? ContezzaArrayUtils.findLast((currentFolder.path.elements || []).concat(currentFolder), (node) =>
                              new Function('node', `return ${this.rootFolderRule}`)(node)
                          )?.id
                        : undefined;
                return [currentFolder, rootId] as const;
            })
        ),
        this.root$,
    ]).pipe(
        map(
            ([[folderNode, rootId], root]): View => ({
                action: this.getAction(folderNode, rootId),
                ...(folderNode && this.showBreadcrumb ? { breadcrumb: { folderNode, rootId, root } } : {}),
            })
        )
    );

    getAction(node?: Node, rootId?: string): View['action'] {
        const pathElements = node?.path?.elements;
        return this.showBreadcrumb && pathElements?.length && (!rootId || rootId !== node.id)
            ? () => this.onBreadcrumbNavigate(pathElements[pathElements.length - 1], node)
            : 'toggle-sidenav';
    }

    constructor(
        @Optional() responsive: ResponsiveService,
        private readonly dynamicSourceProcessor: ContezzaDynamicSourceProcessorService,
        private readonly siteTitles: SiteTitlesService,
        destroy$: DestroyService
    ) {
        responsive?.isMobile$.pipe(takeUntil(destroy$)).subscribe((value) => (this.isMobile = value));
    }

    onBreadcrumbNavigate(targetNode: PathElement, folderNode: Node) {
        this.breadcrumbNavigateSource.next([targetNode, folderNode]);
    }

    private makeBreadcrumbData(folderNode: Node): Observable<Node> {
        const elements = (folderNode.path?.elements || []).concat(folderNode);
        const docLibIndex = elements.findIndex((element) => element.aspectNames?.includes('st:siteContainer'));
        const docLib = elements[docLibIndex];
        const siteFragment = elements[docLibIndex - 1];
        return (docLib ? this.siteTitles.getTitle({ id: siteFragment.name }).pipe(tap((title) => (docLib.name = title || siteFragment.name))) : of(undefined)).pipe(
            map(() => folderNode)
        );
    }
}
