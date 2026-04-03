import { NgUtils } from '@contezza/core/utils';

import { SEARCH_STRATEGIES } from '@contezza/content-services/search/shared';

export const provideSearchStrategies = NgUtils.createFactoryRecordProvider(SEARCH_STRATEGIES);
