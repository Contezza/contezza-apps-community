import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';

import { provideTranslations } from '@alfresco/adf-core';
import { provideExtensionConfig } from '@alfresco/adf-extensions';

import { provideWebscriptApiService } from '@contezza/core/services';

import { RmaApi } from '@contezza/alfresco/rm/apis';

export function provideExtension(): EnvironmentProviders {
    return makeEnvironmentProviders([
        provideTranslations('alfresco/rm', 'assets/alfresco/rm'),
        provideExtensionConfig(['alfresco.rm.actions.json', 'alfresco.rm.icons.json', 'alfresco.rm.rules.json']),
        provideWebscriptApiService(RmaApi),
    ]);
}

export { provideExtension as provideAlfrescoRmExtension };
