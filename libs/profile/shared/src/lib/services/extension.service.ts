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
        tabs.forEach(tab => (tab.components = AdfUtils.filterAndSort(tab.components)));
        return AdfUtils.filterAndSort(tabs);
    }

    // constructor
    private readonly extensions = inject(AdfExtensionService);
    private readonly appExtensions = inject(AppExtensionService);

    private _tabs?: Tab[];
    private get tabs() {
        return (this._tabs ??= ExtensionService.filterAndSortTabs(this.extensions.getFeature<Tab[]>(ExtensionService.FEATURE_KEY)));
    }

    get activeTabs(): Tab[] {
        const filteredTabs = this.tabs.filter(tab => this.filterVisible(tab));
        filteredTabs.forEach(tab => (tab.components = tab.components.filter(item => this.filterVisible(item))));
        return filteredTabs;
    }

    private filterVisible(action: { rules?: { visible?: string } }): boolean {
        if (action.rules?.visible) {
            return this.extensions.evaluateRule(action.rules.visible, this.appExtensions);
        }
        return true;
    }
}

export { ExtensionService as ProfileExtensionService };
