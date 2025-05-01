import { Sort } from '@angular/material/sort';

import { RequestSortDefinitionInner } from '@alfresco/js-api';

export class SortingUtils {
    static ngToAlfresco({ active, direction }: Sort): RequestSortDefinitionInner {
        return { type: 'FIELD', field: active, ascending: direction === 'asc' };
    }

    static alfrescoToNg({ field, ascending }: RequestSortDefinitionInner): Sort {
        return { active: field, direction: ascending ? 'asc' : 'desc' };
    }

    static searchToNodesApi({ field, ascending }: RequestSortDefinitionInner): string[] {
        if (!field) {
            return [];
        }
        const patchField = (field: string): string => {
            // TODO: expand this list
            switch (field) {
                case 'content.mimetype':
                    return 'mimeType';
                case 'content.size':
                    return 'sizeInBytes';
                default:
                    return field;
            }
        };
        return [`${patchField(field)} ${ascending ? 'ASC' : 'DESC'}`];
    }
}
