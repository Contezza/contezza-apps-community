import { ExtensionElement } from '@alfresco/adf-extensions';

export interface ExtensionElementWithRules extends ExtensionElement {
    rules?: {
        enabled?: string;
        visible?: string;
    };
}
