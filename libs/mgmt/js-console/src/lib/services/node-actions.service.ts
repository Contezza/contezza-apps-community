import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { Store } from '@ngrx/store';

import { Subject } from 'rxjs';
import { take } from 'rxjs/operators';

import { ContentNodeDialogService, ContentNodeSelectorComponent, ContentNodeSelectorComponentData, ContentService, ShareDataRow } from '@alfresco/adf-content-services';
import { AppConfigService, DataColumn, ThumbnailService, TranslationService } from '@alfresco/adf-core';
import { Node } from '@alfresco/js-api';

import { setSelectedSpaceNode } from '../store/actions';
import { SelectedNode, SelectScriptPayloadNode } from '../interfaces/js-console';

@Injectable({
    providedIn: 'root',
})
export class JsConsoleNodeActionsService {
    showFilesInResult = false;

    constructor(
        private readonly router: Router,
        private readonly dialog: MatDialog,
        private readonly store: Store<unknown>,
        private readonly config: AppConfigService,
        private readonly translate: TranslationService,
        private readonly contentCoreService: ContentService,
        private readonly thumbnailCoreService: ThumbnailService
    ) {}

    selectScriptPayloadNode(payload: SelectScriptPayloadNode) {
        this.getContentNodeSelection(payload.selectNodeTitle, payload.showFilesInSelect)
            .pipe(take(1))
            .subscribe((selection) => {
                if (selection?.length > 0) {
                    const node = selection[0];
                    if (payload.type === 'spaceNoderef') {
                        this.store.dispatch(setSelectedSpaceNode({ selectedSpaceNode: this.transformSelectedNode(node) }));
                    } else {
                        this.router.navigate(['javascript-console'], { queryParams: { nodeRef: this.constructNodeRef(node.id), name: `${node.name}` } });
                    }
                }
            });
    }

    private transformSelectedNode(node: Node): SelectedNode {
        return {
            nodeRef: this.constructNodeRef(node.id),
            name: node.name,
        };
    }

    private constructNodeRef(id: string): string {
        return `workspace://SpacesStore/${id}`;
    }

    private getContentNodeSelection(title: string, showFilesInResult = false): Subject<Node[]> {
        this.showFilesInResult = showFilesInResult;
        const data: ContentNodeSelectorComponentData = {
            selectionMode: 'single',
            title: this.translate.instant(title),
            currentFolderId: '-root-',
            dropdownHideMyFiles: true,
            rowFilter: this.rowFilter.bind(this),
            imageResolver: this.imageResolverOverride.bind(this),
            select: new Subject<Node[]>(),
            showFilesInResult,
            excludeSiteContent: ContentNodeDialogService.nonDocumentSiteContent,
        };

        this.dialog.open(ContentNodeSelectorComponent, {
            data,
            panelClass: 'adf-content-node-selector-dialog',
            width: '630px',
        });

        data.select.subscribe({
            complete: this.close.bind(this),
        });

        return data.select;
    }

    private rowFilter(row: ShareDataRow): boolean {
        const node: Node = row.node.entry;

        return node.nodeType !== 'app:folderlink' && !this.showFilesInResult ? !node.isFile : true;
    }

    private imageResolverOverride(row: ShareDataRow, _: DataColumn): string | null {
        const entry: Node = row.node.entry;
        const customIcons = (this.config.get('customIcons') as any) || undefined;

        if (!this.contentCoreService.hasAllowableOperations(entry, 'update')) {
            return this.thumbnailCoreService.getMimeTypeIcon('disable/folder');
        }

        if (entry.isFolder && customIcons && 'folder' in customIcons) {
            return customIcons.folder;
        }

        return null;
    }

    private close() {
        this.dialog.closeAll();
    }
}
