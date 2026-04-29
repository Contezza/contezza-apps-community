import { EnvironmentProviders, inject, makeEnvironmentProviders } from '@angular/core';

import { of } from 'rxjs';

import { provideTranslations } from '@alfresco/adf-core';
import { provideExtensionConfig } from '@alfresco/adf-extensions';

import { ContezzaUtils } from '@contezza/core/utils';

import { provideLinkGenerators } from './providers';
import { PublicLinkService } from './services/public-link.service';

export function provideShare(): EnvironmentProviders {
    return makeEnvironmentProviders([
        provideTranslations('content-services/share', 'assets/content-services/share'),
        provideExtensionConfig(['content-services.share.actions.json', 'content-services.share.rules.json', 'content-services.share.json']),
        provideLinkGenerators({
            'content-services.share.link-types.public': (publicLinkService = inject(PublicLinkService)) => publicLinkService.linkGenerator,
            'content-services.share.link-types.intern': () => {
                const baseUrl = ContezzaUtils.baseUrl;
                return nodes =>
                    of(
                        nodes.map(node => ({
                            link: `${baseUrl}/#/view/(viewer:${node.id})`,
                            label: node.name,
                            location: node.path?.elements?.find(el => el.nodeType === 'st:site')?.name,
                        })),
                    );
            },
        }),
    ]);
}
