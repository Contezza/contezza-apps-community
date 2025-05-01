import { Tree } from '@contezza/core/utils';

export interface SimpleLayoutItem {
    type?: LayoutItemTypes;
    value: string;
    class?: string;
}

export enum LayoutItemTypes {
    Icon = 'icon',
    Image = 'image',
    Text = 'text',
}

export type LayoutItem = Tree<SimpleLayoutItem, 'children'>;
