import { ExtensionElement } from '@alfresco/adf-extensions';

interface ExtensionElementWithRules extends ExtensionElement {
    rules?: {
        enabled?: string;
        visible?: string;
    };
}
interface ExtensionComponent extends ExtensionElementWithRules {
    component: string | { id: string; data?: any };
}

export interface Tab extends ExtensionElementWithRules {
    label: string;
    icon?: string;
    urlFragment: string;
    components: ExtensionComponent[];
}
