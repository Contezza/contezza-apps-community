import { Observable } from 'rxjs';

import { Node } from '@alfresco/js-api';

import { LinkSettings } from './link-settings';
import { ShareSettings } from './share-settings';

export type LinkGenerator = (nodes: Node[], settings: LinkSettings) => Observable<{ label: string; link: string }[]>;

export interface ShareActionPayload {
    nodes: Node[];
    settings: ShareSettings;
    generateLinks: LinkGenerator;
}
