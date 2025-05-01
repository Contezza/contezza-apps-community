import { Injectable } from '@angular/core';

import { Node, PathElement } from '@alfresco/js-api';
import { RuleContext, RuleService } from '@alfresco/adf-extensions';

import { ContezzaUtils } from '@contezza/core/utils';

@Injectable({ providedIn: 'root' })
export class LocationService {
    static readonly ASPECTS_LOCATION = ['tza:zaak', 'tza:object', 'tza:dossier', 'stuf:zkn'];
    static readonly isLocation = ({ element }: any) =>
        element.nodeType === 'st:site' || (element.aspectNames && LocationService.ASPECTS_LOCATION.some((aspect) => element.aspectNames.includes(aspect)));

    constructor(private readonly rules: RuleService) {}

    /**
     * Gets the location of the given node.
     * The location is selected by parsing the node ancestors looking for the first item satisfying a given condition.
     * This condition can be defined by a custom rule.
     *
     * @param node
     * @param rule
     */
    getLocation(node: Node, rule?: string): PathElement | undefined {
        let elementaryRule: (element: PathElement) => boolean;
        if (rule) {
            // a custom rule is defined
            const parsedRule = ContezzaUtils.stringToFunction(rule);
            const isElementaryRule = !rule.startsWith('pathElements');
            if (isElementaryRule) {
                // the custom rule applies elementwise: use this rule to parse the path.elements array
                elementaryRule = parsedRule as any;
            } else {
                // the custom rule applies to the path.elements array: use this rule immediately
                return parsedRule(node.path.elements);
            }
        } else {
            // no custom rule is defined: use default rule to parse the path.elements array
            elementaryRule = (element) => this.isLocation(element);
        }

        if (elementaryRule(node)) {
            // the node itself is a location
            return undefined;
        }
        let location: PathElement;
        if (node?.path?.elements) {
            // parse the path.elements array to select the node location
            const pathElements = node.path.elements;
            let i = pathElements.length - 1;
            while (i >= 0 && !location) {
                const element = pathElements[i];
                if (elementaryRule(element)) {
                    location = element;
                }
                i--;
            }
            if (!location) {
                location = pathElements[pathElements.length - 1];
            }
        }
        return location;
    }

    protected isLocation(element: PathElement): boolean {
        return this.rules.evaluateRule('app.element.isLocation', { element } as any as RuleContext);
    }
}
