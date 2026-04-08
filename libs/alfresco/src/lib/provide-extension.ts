import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';

import { provideTranslations } from '@alfresco/adf-core';

import { provideEvaluators } from '@contezza/core/extensions';
import { AdfUtils } from '@contezza/core/utils';

export function provideExtension(): EnvironmentProviders {
    return makeEnvironmentProviders([
        provideTranslations('alfresco', 'assets/alfresco'),
        provideEvaluators(
            // alfresco.selection.aspectNames.includeSome
            AdfUtils.makeRules(
                'aspectNames.includeSome',
                (node, _context, aspectNames: string[]) => {
                    const nodeAspectNames = node.aspectNames;
                    return !!(nodeAspectNames?.length && aspectNames?.some(aspectName => nodeAspectNames.includes(aspectName)));
                },
                { prefix: 'alfresco' },
            ),
        ),
    ]);
}

export { provideExtension as provideAlfrescoExtension };
