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
