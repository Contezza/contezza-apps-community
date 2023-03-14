import { Injectable } from '@angular/core';

import { Node } from '@alfresco/js-api';
import { ExtensionElement, ExtensionService, filterEnabled, sortByOrder } from '@alfresco/adf-extensions';

interface DynamicFormResolver extends ExtensionElement, DynamicForm {
    rules?: {
        [key: string]: string;
        selected?: string;
    };
}

interface DynamicForm {
    formId: string;
    layoutId?: string;
}

@Injectable({
    providedIn: 'root',
})
export class ContezzaDynamicFormResolverService {
    private _resolvers: DynamicFormResolver[];
    private get resolvers(): DynamicFormResolver[] {
        if (!this._resolvers) {
            this._resolvers = this.extensions.getFeature('dynamicform-resolvers').filter(filterEnabled).sort(sortByOrder);
        }
        return this._resolvers;
    }

    constructor(private readonly extensions: ExtensionService) {}

    getDynamicFormByTargetNode(node: Node): DynamicForm {
        const resolvers = this.resolvers;

        let form: DynamicFormResolver;
        let i = 0;
        while (!form && i < resolvers.length) {
            const resolver = resolvers[i];
            if (!resolver.rules?.selected || this.evaluateRule(resolver.rules.selected, node)) {
                form = resolver;
            }
            i++;
        }

        if (!form) {
            throw new Error('No dynamic form for node ' + node.id);
        }

        return { formId: form.formId, layoutId: form.layoutId };
    }

    private evaluateRule(rule: string, node: Node): boolean {
        return new Function('node', `return ${rule}`)(node);
    }
}
