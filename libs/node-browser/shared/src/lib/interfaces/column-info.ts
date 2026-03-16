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
