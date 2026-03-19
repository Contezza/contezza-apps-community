import { NavBarGroupRef, NavBarLinkRef } from '@alfresco/adf-extensions';

export interface NavbarGroup extends NavBarGroupRef {
    items: NavbarItem[];
}

export interface NavbarItem extends NavBarLinkRef {
    click?: {
        action: string;
        payload: string;
    };
    /**
     * If set `true` in a navbar-item child, navigating to the parent redirects to this child.
     */
    favourite?: boolean;
    /**
     * Allows to define whether the item is active based on a regular expression.
     */
    urlMatcher?: string;
    children?: NavbarItem[];
    /**
     * If set `true` in a navbar item with children, in collapsed mode this item does not appear and its children appear as independent items.
     */
    openInCollapsed?: boolean;
}
