import { ApiUtils, BaseApi } from '@contezza/core/utils';

import { Rmauditlog, RmAuditlogQueryParameters } from './models';

const { toEndpointTemplate, queryParametersToString } = ApiUtils;

export class RmaApi extends BaseApi {
    static readonly ENDPOINT_NODE_RMAUDITLOG = 'api/node/{store_type}/{store_id}/{id}/rmauditlog';
    static readonly ENDPOINT_ALL_RMAUDITLOGS = 'api/rma/admin/rmauditlog';

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

    readAllRmauditlogs(queryParameters: RmAuditlogQueryParameters = {}) {
        return this.http.get<{ data: Rmauditlog }>(RmaApi.ENDPOINT_ALL_RMAUDITLOGS + queryParametersToString(queryParameters, { arrayFormat: 'repeat' }));
    }
}
