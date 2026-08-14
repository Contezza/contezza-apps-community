export interface RmAuditlogQueryParameters {
    /**
     * Eerste datum van het event. Meegeven als date (yyyy-MM-dd).
     */
    from?: string;
    /**
     * Uiterste datum van het event. Meegeven als date (yyyy-MM-dd). Deze datum is niet inclusief, zoals in Keycloak documentatie staat.
     */
    to?: string;
    /**
     * Paging offset.
     */
    first?: number;
    /**
     * Het maximum aantal resultaten (defaults to 100).
     */
    size?: number;
    /**
     * De types van events, hiervan kunnen er meerdere worden gegeven, in het format "/events?type=EVENT_TYPE_1&type=EVENT_TYPE_2".
     */
    event?: string[];
    /**
     * De User id, een UUID.
     */
    user?: string;
}
