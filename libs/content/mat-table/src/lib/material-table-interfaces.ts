import { ColumnInfo } from '@contezza/utils';

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
