import { inject, Injectable } from '@angular/core';

import { AppExtensionService } from '@alfresco/aca-shared';
import { ExtensionService as AdfExtensionService } from '@alfresco/adf-extensions';

import { AdfUtils } from '@contezza/core/utils';

import { Tab } from '../models';

@Injectable({
    providedIn: 'root',
})
export class ExtensionService {
    static readonly FEATURE_KEY = 'profile.tabs';

    static filterAndSortTabs(tabs: Tab[]): Tab[] {
        tabs.forEach(tab => AdfUtils.filterAndSort(tab.components));
        return AdfUtils.filterAndSort(tabs);
    }

    // constructor
    private readonly extensions = inject(AdfExtensionService);
    private readonly appExtensions = inject(AppExtensionService);

    private _tabs?: Tab[];
    private get tabs() {
        console.log('get tabs');
        return (this._tabs ??= ExtensionService.filterAndSortTabs(this.extensions.getFeature<Tab[]>('profile.tabs')));
    }

    get activeTabs(): Tab[] {
        return this.tabs.filter(tab => this.filterVisible(tab));
    }

    private filterVisible(action: { rules?: { visible?: string } }): boolean {
        if (action.rules?.visible) {
            return this.extensions.evaluateRule(action.rules.visible, this.appExtensions);
        }
        // TODO: apply to children
        return true;
    }
}

export { ExtensionService as ProfileExtensionService };
