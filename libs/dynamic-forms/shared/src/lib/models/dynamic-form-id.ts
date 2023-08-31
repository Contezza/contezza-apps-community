import { ContezzaDynamicForm } from '../classes';

export interface DynamicFormId {
    id: string;
    layoutId?: string;
}

export type ExtendedDynamicFormId = string | DynamicFormId;

export type DynamicFormDefinition = DynamicFormId & { providedDependencies?: ContezzaDynamicForm['providedDependencies'] };
export type ExtendedDynamicFormDefinition = string | DynamicFormDefinition;
