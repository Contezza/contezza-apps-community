import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';

import type { ViewNodeAction } from '@alfresco/aca-shared/store';
import { Node } from '@alfresco/js-api';

import { ILinkResolver } from '@contezza/core/services';

/**
 * Rewrites the logic of ACA {@link ViewNodeAction} effect as a link resolver.
 */
@Injectable()
export class FileLinkResolver implements ILinkResolver<Node> {
    // constructor
    private readonly router = inject(Router);

    resolve(target: Node) {
        if (target.isFile) {
            const currentUrl = this.router.url;
            // necessary if underlying-table links are generated while in viewer overlay
            const baseUrl = currentUrl.split('/(viewer:view/')[0]!;
            return baseUrl + `/(viewer:view/${target.id})?location=${baseUrl}`;
        } else {
            return null;
        }
    }
}
