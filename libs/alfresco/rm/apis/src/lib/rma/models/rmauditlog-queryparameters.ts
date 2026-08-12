export interface RmAuditlogQueryParameters {
    /**
     * Eerste datum van het event. Meegeven als date (yyyy-MM-dd).
     */
    dateFrom?: string;
    /**
     * Uiterste datum van het event. Meegeven als date (yyyy-MM-dd). Deze datum is niet inclusief, zoals in Keycloak documentatie staat.
     */
    dateTo?: string;
    /**
     * Paging offset.
     */
    first?: number;
    /**
     * Het maximum aantal resultaten (defaults to 100).
     */
    max?: number;
    /**
     * De types van events, hiervan kunnen er meerdere worden gegeven, in het format "/events?type=EVENT_TYPE_1&type=EVENT_TYPE_2".
     */
    type?: string[];
    /**
     * De Keycloak User id, een UUID.
     */
    user?: string;
    /**
     * De gebruikersnaam zoals bekend in Keycloak. Dit moet een exacte match zijn. Als deze optie is gegeven, wordt de parameter `user` genegeerd.
     */
    username?: string;
}
