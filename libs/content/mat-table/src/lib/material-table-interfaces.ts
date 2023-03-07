import { DocumentListPresetRef } from '@alfresco/adf-extensions';

export interface ColumnInfo extends Partial<DocumentListPresetRef> {
    name?: string;
    displayName?: string;
    hidden?: boolean;
    enabled?: boolean;
    onSmallScreen?: boolean;
    value?: any;
    component?: string;
}

export interface MaterialTableAction {
    name: string;
    action: string;
    title: string;
    icon: string;
}

export interface MaterialTableEmptyContent {
    icon: string;
    title: string;
    subtitle?: string;
}

export interface MaterialTableColumnData {
    element?: any;
    columns?: Array<ColumnInfo>;
    actions?: Array<MaterialTableAction>;
    expanded?: boolean;
    dataSource?: any;
    class?: string;
    key?: string;
}
