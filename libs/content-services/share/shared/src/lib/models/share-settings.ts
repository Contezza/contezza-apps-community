import { Channel } from './channel';
import { LinkSettings } from './link-settings';
import { LinkType } from './link-type';

export interface ShareSettings extends LinkSettings {
    linkType: LinkType;
    channel: Channel;
}
