import { NgModule } from '@angular/core';

import { provideTranslations } from '@alfresco/adf-core';
import { provideExtensionConfig } from '@alfresco/adf-extensions';

import { provideDynamicComponents } from '@contezza/core/dynamic-component/shared';

@NgModule({
    imports: [],
    providers: [
        provideTranslations('profile', 'assets/profile'),
        provideExtensionConfig(['profile.json']),
        provideDynamicComponents<any>({
            'profile.tab-components.alfresco-info': () => import('@contezza/profile/components/alfresco-info').then(m => m.AlfrescoInfoComponent),
            'profile.tab-components.app-info': () => import('@contezza/profile/components/app-info').then(m => m.AppInfoComponent),
            'profile.tab-components.language-settings': () => import('@contezza/profile/components/language-settings').then(m => m.LanguageSettingsComponent),
            'profile.tab-components.user-form': () => import('@contezza/profile/components/user-form').then(m => m.UserFormComponent),
            'profile.tab-components.user-groups': () => import('@contezza/profile/components/user-groups').then(m => m.UserGroupsComponent),
            'profile.tab-components.user-info': () => import('@contezza/profile/components/user-info').then(m => m.UserInfoComponent),
        }),
    ],
})
export class ExtensionModule {}

export { ExtensionModule as ProfileExtensionModule };
