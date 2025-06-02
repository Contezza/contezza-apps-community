import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { Node } from '@alfresco/js-api';
import { AlfrescoViewerModule } from '@alfresco/adf-content-services';

import { ISearchResultPreview } from '@contezza/content-services/search/shared';

@Component({
    standalone: true,
    imports: [AlfrescoViewerModule],
    selector: 'contezza-viewer-search-result-preview',
    template: `<adf-alfresco-viewer #viewer [nodeId]="result.id" (showViewerChange)="close.next()"></adf-alfresco-viewer>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewerSearchResultPreviewComponent implements ISearchResultPreview<Node> {
    @Input()
    result: Node;

    @Output()
    // eslint-disable-next-line @angular-eslint/no-output-native
    readonly close = new EventEmitter<void>();
}
