import { NBName } from './node-browser-name';

export interface NodeBrowserViewResponse {
    aspects: Array<NBName>;
    assocs: Array<NBAssoc>;
    children: Array<NBNode>;
    id: string;
    name: NBName;
    nodeRef: string;
    parentNodeRef: string;
    parents: Array<NBNode>;
    permissions: NBPermissions;
    properties: Array<NBProperty>;
    qnamePath: NBName;
    sourceAssocs: Array<NBAssoc>;
    type: NBName;
}

export interface NBAssoc {
    assocType: NBName;
    sourceRef: string;
    targetRef: string;
}

export interface NBNode {
    assocType: NBName;
    index: number;
    name: NBName;
    nodeRef: string;
    primary: boolean;
    type: NBName;
}

export interface NBPermissions {
    entries: Array<NBPermissionInfo>;
    inherit: boolean;
    masks: Array<NBPermissionInfo>;
    owner: string;
}

export interface NBPermissionInfo {
    authority: string;
    permission: string;
    rel: string;
}

export interface NBProperty {
    multiple: boolean;
    name: NBName;
    residual: boolean;
    type: NBName;
    values: Array<NBPropertyValue>;
}

export interface NBPropertyValue {
    dataType: string;
    isContent: boolean;
    isNodeRef: boolean;
    isNullValue: boolean;
    value: string;
}

export interface NodeBrowserViewItem {
    id: string;
    type: NodeBrowserViewItemType;
    title: string;
    expanded: boolean;
    keyValueDataset?: Record<string, string>;
    key?: string;
    displayKey?: string;
    multipleTables?: Array<string>;
}

export type NodeBrowserViewItemType = 'keyValue' | 'chipsArray' | 'array' | 'table' | 'permissions';
