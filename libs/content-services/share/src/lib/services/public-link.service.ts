import { inject, Injectable } from '@angular/core';

import { map, of, tap } from 'rxjs';

import moment from 'moment';

import { SharedLinksApiService } from '@alfresco/adf-content-services';
import { Node } from '@alfresco/js-api';

import { AlfrescoUtils, ContezzaObservables, ContezzaUtils, Property } from '@contezza/core/utils';

import { LinkSettings } from '@contezza/content-services/share/shared';

@Injectable({ providedIn: 'root' })
export class PublicLinkService {
    static readonly FORMAT_DATE = 'YYYY-MM-DDTHH:mm:ss.SSSZZ';
    static readonly PROPERTY_QSHARE_SHARED_ID = new Property('qshare:sharedId', String);

    static formatDate(date: moment.Moment): string {
        return moment(date).add(1, 'days').subtract(1, 'seconds').format(PublicLinkService.FORMAT_DATE);
    }

    // constructor
    private readonly sharedLinksApi = inject(SharedLinksApiService);

    get linkGenerator() {
        const baseUrl = ContezzaUtils.baseUrl;
        return (nodes: Node[], settings: LinkSettings) => {
            const endDate = settings.endDate ? PublicLinkService.formatDate(settings.endDate) : null;
            return ContezzaObservables.forkJoin(
                nodes.map(node => {
                    const sharedId = AlfrescoUtils.getNodePropertyValue(node, PublicLinkService.PROPERTY_QSHARE_SHARED_ID);
                    return (
                        sharedId
                            ? of(sharedId)
                            : this.sharedLinksApi
                                  .createSharedLinks(node.id, {
                                      nodeId: node.id,
                                      expiresAt: endDate as any,
                                  })
                                  .pipe(
                                      map(data => data.entry.id),
                                      tap(id => AlfrescoUtils.setNodePropertyValue(node, PublicLinkService.PROPERTY_QSHARE_SHARED_ID, id)),
                                  )
                    ).pipe(map(id => ({ label: node.name, link: `${baseUrl}/#/preview/s/${id}` })));
                }),
            );
        };
    }
}
