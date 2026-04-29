export interface Channel {
    id: string;
    actionType: string;
    label?: string;
    tooltip?: string;
    description?: string;
    allowedByLinkTypes?: string[];
}
