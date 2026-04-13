import { ExtensionElement } from '@alfresco/adf-extensions';

export interface Theme extends ExtensionElement {
    label?: string;
    image?: string;
    cssClass?: string;
}
