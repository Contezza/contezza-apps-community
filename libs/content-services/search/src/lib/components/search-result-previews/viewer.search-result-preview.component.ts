import { ChangeDetectionStrategy, Component, EventEmitter, Input, input, Output } from '@angular/core';

import { AlfrescoViewerComponent } from '@alfresco/adf-content-services';
import { Node } from '@alfresco/js-api';

import { ISearchResultPreview } from '@contezza/content-services/search/shared';

/**
 * Settings supported by the underlying adf-alfresco-viewer.
 */
interface Settings {
    allowGoBack?: boolean;
}

@Component({
    standalone: true,
    imports: [AlfrescoViewerComponent],
    selector: 'contezza-viewer-search-result-preview',
    template: `<adf-alfresco-viewer #viewer [nodeId]="result.id" [allowGoBack]="settings()?.allowGoBack ?? true" (showViewerChange)="close.next()" />`,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewerSearchResultPreviewComponent implements ISearchResultPreview<Node> {
    @Input()
    result: Node;

    /**
     * Settings supported by the underlying adf-alfresco-viewer.
     */
    readonly settings = input<Settings | undefined>(undefined);

    @Output()
    // eslint-disable-next-line @angular-eslint/no-output-native
    readonly close = new EventEmitter<void>();
}
