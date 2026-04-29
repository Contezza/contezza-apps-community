export enum EndDateType {
    REQUIRED = 'required',
    OPTIONAL = 'optional',
    NONE = 'none',
}

export interface LinkType {
    id: string;
    selected?: boolean;
    icon?: string;
    label?: string;
    description?: string;
    placeholder?: string;
    tooltip?: string;
    endDateType?: EndDateType;
}
