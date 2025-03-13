import { Injectable } from '@angular/core';

import { forkJoin, Observable, of, switchMap } from 'rxjs';

import { DocumentListService, NodesApiService } from '@alfresco/adf-content-services';

@Injectable({ providedIn: 'root' })
export class FolderTemplateService {
    constructor(private readonly documentListService: DocumentListService, private readonly nodes: NodesApiService) {}

    /**
     * Copy all children of the first node as children of the second node.
     *
     * @param templateId
     * @param targetId
     */
    copyFolderTemplate(templateId: string, targetId: string): Observable<unknown> {
        return this.nodes.getNodeChildren(templateId).pipe(
            switchMap((children) => {
                const list = children?.list?.entries;
                if (list?.length) {
                    return forkJoin(list.map((child) => this.documentListService.copyNode(child.entry.id, targetId)));
                } else {
                    return of([]);
                }
            })
        );
    }
}
