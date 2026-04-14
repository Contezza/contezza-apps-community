import { Stylable } from '@contezza/core/utils';

export enum ComponentType {
    CARD = 'card',
    CUSTOM = 'custom',
}

export interface Component extends Stylable {
    id: string;
    title?: string;
    type?: ComponentType;
    component: string;
    inputs?: any;
}

export interface Tab {
    id: string;
    label: string;
    icon?: string;
    urlFragment: string;
    components: Component[];
}
