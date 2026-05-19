export interface Channel {
    id: string;
    actionType: string;
    label: string;
    allowedByLinkTypes?: string[];
}
