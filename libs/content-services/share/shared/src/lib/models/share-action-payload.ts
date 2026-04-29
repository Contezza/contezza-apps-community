import { Observable } from 'rxjs';

import { Moment } from 'moment';

import { Node } from '@alfresco/js-api';

import { LinkSettings } from './link-settings';
import { ShareSettings } from './share-settings';

export type LinkGenerator = (nodes: Node[], settings: LinkSettings) => Observable<{ link: string; label: string; location?: string; endDate?: Moment }[]>;

export interface ShareActionPayload {
    nodes: Node[];
    settings: ShareSettings;
    generateLinks: LinkGenerator;
}
