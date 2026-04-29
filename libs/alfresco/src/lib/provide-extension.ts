import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';

import { provideEvaluators } from '@contezza/core/extensions';
import { provideWebscriptApiService } from '@contezza/core/services';
import { AdfUtils } from '@contezza/core/utils';

import { CommunityRepoApi } from '@contezza/alfresco/apis';

import { EmailService } from './services/email.service';

export function provideExtension(): EnvironmentProviders {
    return makeEnvironmentProviders([
        // provideTranslations('alfresco', 'assets/alfresco'),
        provideEvaluators({
            // alfresco.selection.aspectNames.includeSome
            ...AdfUtils.makeRules(
                'aspectNames.includeSome',
                (node, _context, aspectNames: string[]) => {
                    const nodeAspectNames = node.aspectNames;
                    return !!(nodeAspectNames?.length && aspectNames?.some(aspectName => nodeAspectNames.includes(aspectName)));
                },
                { prefix: 'alfresco' },
            ),
            // alfresco.selection.properties.includeSome
            ...AdfUtils.makeRules(
                'properties.includeSome',
                (node, _context, properties: string[]) => {
                    const nodeProperties = Object.keys(node.properties || {});
                    return !!(nodeProperties?.length && properties?.some(property => nodeProperties.includes(property)));
                },
                { prefix: 'alfresco' },
            ),
        }),
        provideWebscriptApiService(CommunityRepoApi),
        EmailService.provide(),
    ]);
}

export { provideExtension as provideAlfrescoExtension };
