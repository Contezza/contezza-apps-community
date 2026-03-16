import { ExtensionElement } from '@alfresco/adf-extensions/lib/config/extension-element';
import { NavBarLinkRef } from '@alfresco/adf-extensions/lib/config/navbar.extensions';

export interface ExtendedNavbarGroup extends ExtensionElement {
    items: ExtendedNavbarItem[];
}

export interface ExtendedNavbarItem extends Omit<NavBarLinkRef, 'children'> {
    children: string;
}
