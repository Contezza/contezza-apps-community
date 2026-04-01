import { ApiUtils, BaseApi } from '@contezza/core/utils';

import { Rmauditlog } from './models';

const { toEndpointTemplate } = ApiUtils;

export class RmaApi extends BaseApi {
    static readonly ENDPOINT_NODE_RMAUDITLOG = 'api/node/{store_type}/{store_id}/{id}/rmauditlog';

    static readonly TEMPLATE_ENDPOINT_NODE_RMAUDITLOG = toEndpointTemplate(RmaApi.ENDPOINT_NODE_RMAUDITLOG);

    /**
     * Returns an audit log of Records Management events.
     *
     * @param store_type
     * @param store_id
     * @param id
     */
    readNodeRmauditlog(store_type: string, store_id: string, id: string) {
        return this.http.get<{ data: Rmauditlog }>(RmaApi.TEMPLATE_ENDPOINT_NODE_RMAUDITLOG({ store_type, store_id, id }));
    }
}
