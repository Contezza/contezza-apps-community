import { NgUtils } from '@contezza/core/utils';

import { LINK_GENERATOR } from '@contezza/content-services/share/shared';

export const provideLinkGenerators = NgUtils.createFactoryRecordProvider(LINK_GENERATOR);
