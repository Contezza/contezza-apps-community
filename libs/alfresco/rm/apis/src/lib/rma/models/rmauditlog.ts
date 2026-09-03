export interface Rmauditlog {
    entries: RmauditlogEntry[];
}

export interface RmauditlogEntry {
    timestamp: string;
    fullName: string;
    event: string;
    nodeRef: string;
    nodeName: string;
    nodeType: string;
    userRole: string;
    path: string;
    identifier: string;
    changedValues: RmauditlogEntryChangedValue[];
}

export interface RmauditlogEntryChangedValue {
    name: string;
    previous: string;
    new: string;
}

export interface RmauditlogQueryParameters {
    /**
     * Maximum number of log entries to return.
     */
    size?: number;
    /**
     * Only return log entries by the specified user.
     */
    user?: string;
    /**
     * Only return log entries matching this event.
     */
    event?: string;
    /**
     * Only return log entries after the specified date, date should be in yyyy-MM-dd format.
     */
    from?: string;
    /**
     * Only return log entries before the specified date, date should be in yyyy-MM-dd format.
     */
    to?: string;
}
