import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';

import { Observable } from 'rxjs';
import { filter, switchMap, takeUntil } from 'rxjs/operators';

import { ExtensionService } from '@alfresco/adf-extensions';

import { DestroyService } from '@contezza/core/services';

import { setExpandedPanelState, togglePanels } from '../../store/actions';
import { getBrowseLoading, getBrowseNodeRef, getExpandedPanelState } from '../../store/selectors';

import { NodeBrowserService } from '../../services/node-browser.service';
import { NodeBrowserViewItemComponent } from './view-item/view-item.component';
import { NodeBrowserViewItem, NodeBrowserViewResponse } from '../../interfaces/node-browser-view';

@Component({
    selector: 'mgmt-node-browser-view',
    templateUrl: './node-browser-view.component.html',
    styleUrls: ['./node-browser-view.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [DestroyService],
})
export class NodeBrowserViewComponent implements OnInit, OnDestroy {
    title: string;
    readonly viewItems: Array<NodeBrowserViewItem> = (this.extensions.getFeature('view-items') as any) || [];
    readonly loading$: Observable<boolean> = this.store.select(getBrowseLoading);
    readonly expandedPanelState$: Observable<boolean> = this.store.select(getExpandedPanelState);
    readonly data$: Observable<NodeBrowserViewResponse> = this.store.select(getBrowseNodeRef).pipe(
        filter((nodeRef) => !!nodeRef),
        switchMap((nodeRef) => this.nodeBrowserService.browse(nodeRef))
    );

    @ViewChildren(NodeBrowserViewItemComponent)
    items: QueryList<NodeBrowserViewItemComponent>;

    constructor(
        readonly store: Store<unknown>,
        private readonly actions$: Actions,
        private readonly route: ActivatedRoute,
        private readonly extensions: ExtensionService,
        private readonly nodeBrowserService: NodeBrowserService,
        @Inject(DestroyService) readonly destroy$: DestroyService
    ) {}

    trackById(_: number, item: NodeBrowserViewItem) {
        return item.id;
    }

    ngOnInit(): void {
        const { route } = this;
        const { data } = route.snapshot;

        this.title = data.title;
        this.actions$.pipe(ofType(togglePanels), takeUntil(this.destroy$)).subscribe(({ expanded }) => this.items.forEach((item) => item.toggleExpansionPanel(expanded)));
    }

    togglePanels(state: boolean) {
        this.store.dispatch(setExpandedPanelState({ expandedPanelState: state }));
        this.store.dispatch(togglePanels({ expanded: state }));
    }

    ngOnDestroy(): void {
        this.store.dispatch(setExpandedPanelState({ expandedPanelState: false }));
    }
}
