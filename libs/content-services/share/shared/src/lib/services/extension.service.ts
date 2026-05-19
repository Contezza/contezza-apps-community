import { inject, Injectable, InjectionToken } from '@angular/core';

import { Action } from '@ngrx/store';

import { AppExtensionService } from '@alfresco/aca-shared';
import { ContentActionType, ExtensionElement, ExtensionService as AdfExtensionService } from '@alfresco/adf-extensions';
import { Node } from '@alfresco/js-api';

import { ExtensionElementWithRules } from '@contezza/core/extensions';
import { AdfUtils } from '@contezza/core/utils';

import { Channel, LinkGenerator, LinkType, ShareActionPayload, ShareSettings } from '../models';

export type LinkGeneratorRecord = Record<string, LinkGenerator>;
export const LINK_GENERATOR = new InjectionToken<LinkGeneratorRecord[]>('LINK_GENERATOR');

@Injectable({ providedIn: 'root' })
export class ExtensionService {
    static readonly FEATURE_KEY_LINK_TYPES = 'content-services.share.linkTypes';
    static readonly FEATURE_KEY_CHANNELS = 'content-services.share.channels';

    // constructor
    private readonly extensions = inject(AdfExtensionService);
    private readonly appExtensions = inject(AppExtensionService);
    private readonly _lgrs = inject(LINK_GENERATOR, { optional: true });

    private _linkTypes?: (LinkType & ExtensionElementWithRules)[];
    private get linkTypes() {
        return (this._linkTypes ??= AdfUtils.filterAndSort<LinkType & ExtensionElementWithRules>(this.extensions.getFeature(ExtensionService.FEATURE_KEY_LINK_TYPES, [])));
    }
    private _channels?: (Channel & ExtensionElement)[];
    private get channels() {
        return (this._channels ??= AdfUtils.filterAndSort<Channel & ExtensionElement>(this.extensions.getFeature(ExtensionService.FEATURE_KEY_CHANNELS, [])));
    }

    get allowedLinkTypes(): LinkType[] {
        return this.linkTypes.filter(linkType => this.appExtensions.filterVisible({ ...linkType, type: ContentActionType.default }));
    }

    private readonly linkGenerators = new Map<string, LinkGenerator>();

    constructor() {
        this._lgrs?.forEach(list => {
            Object.entries(list).forEach(([key, value]) => this.linkGenerators.set(key, value));
        });
    }

    getChannelsByLinkType(linkType: LinkType | string) {
        const linkTypeId = typeof linkType === 'string' ? linkType : linkType.id;

        return this.channels.filter(({ allowedByLinkTypes }) => {
            if (allowedByLinkTypes) {
                const match = (x: string, y: string): boolean => (x.startsWith('!') ? x !== '!' + y : x === y);
                return allowedByLinkTypes.every(id => match(id, linkTypeId));
            } else {
                // no list then everything is allowed
                return true;
            }
        });
    }

    makeShareAction(nodes: Node[], settings: ShareSettings): Action & { payload: ShareActionPayload } {
        const linkTypeId = settings.linkType.id;
        const generateLinks = this.linkGenerators.get(linkTypeId);
        if (generateLinks) {
            return {
                type: settings.channel.actionType,
                payload: {
                    nodes,
                    settings,
                    generateLinks,
                },
            };
        } else {
            throw new Error(`No link generator provided for link type ${linkTypeId}`);
        }
    }
}

export { ExtensionService as ContentServicesShareExtensionService };
