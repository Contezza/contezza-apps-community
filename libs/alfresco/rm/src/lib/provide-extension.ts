import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';

import { of } from 'rxjs';

import { provideTranslations } from '@alfresco/adf-core';
import { provideExtensionConfig } from '@alfresco/adf-extensions';

import { provideWebscriptApiService } from '@contezza/core/services';

import { RmaApi } from '@contezza/alfresco/rm/apis';
import { provideSearchStrategies } from '@contezza/content-services/search';

export function provideExtension(): EnvironmentProviders {
    return makeEnvironmentProviders([
        provideTranslations('alfresco/rm', 'assets/alfresco/rm'),
        provideExtensionConfig(['alfresco.rm.actions.json', 'alfresco.rm.icons.json', 'alfresco.rm.rules.json', 'alfresco.rm.search-page-configs.json']),
        provideWebscriptApiService(RmaApi),
        provideSearchStrategies({
            'rm.search-strategies.events':
                () =>
                ({ parameters }) => {
                    const { skipCount, maxItems } = parameters.paging;
                    console.log(skipCount, maxItems);

                    return of({});
                },
        }),
    ]);
}

export { provideExtension as provideAlfrescoRmExtension };
