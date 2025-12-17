export enum PresetType {
    DynamicForm = 'dynamic-form',

    HeaderFilters = 'header-filters',
    ColumnFilters = 'column-filters',
    SidebarFilters = 'sidebar-filters',
    LeftSidebarFilters = 'left-sidebar-filters',
}

export interface SavePresetPayload {
    json: object;
    nodeName: string;
    nodeId?: string;
    global?: boolean;
    properties?: {};
}
