import { ApiUtils, BaseApi } from '@contezza/core/utils';

import { ActionProcessorBody } from './models';

const { concatPath, queryParametersToString } = ApiUtils;

export class CommunityRepoApi extends BaseApi {
    static readonly ENDPOINT = 'api';

    static readonly ENDPOINT_ACTION_QUEUE = concatPath(CommunityRepoApi.ENDPOINT, 'actionQueue');

    queueAction<TName extends string, TParameters, TResponse>(queryParameters: { async?: boolean }, body: ActionProcessorBody<TName, TParameters, TResponse>) {
        return this.http.post<TResponse>(CommunityRepoApi.ENDPOINT_ACTION_QUEUE + queryParametersToString(queryParameters), body);
    }
}
