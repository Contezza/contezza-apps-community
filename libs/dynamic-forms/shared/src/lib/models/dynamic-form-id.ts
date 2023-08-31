export interface DynamicFormId {
    id: string;
    layoutId?: string;
}

export type ExtendedDynamicFormId = string | DynamicFormId;
