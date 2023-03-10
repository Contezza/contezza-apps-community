import { MinimalNodeEntity } from '@alfresco/js-api';
import { SelectionState } from '@alfresco/adf-extensions';

export class ContezzaAcaUtils {
    static makeSelectionState(nodes: MinimalNodeEntity[]): SelectionState {
        const count = nodes.length;
        const isEmpty = nodes.length === 0;

        let first = null;
        let last = null;
        let file = null;
        let folder = null;
        let library = null;

        if (nodes.length > 0) {
            first = nodes[0];
            last = nodes[nodes.length - 1];

            if (nodes.length === 1) {
                file = nodes.find((entity: any) => !!(entity.entry.isFile || entity.entry.nodeId || entity.entry.sharedByUser));
                folder = nodes.find((entity: any) => entity.entry.isFolder);
            }
        }

        const libraries: any[] = nodes.filter((node: any) => node.isLibrary);
        if (libraries.length === 1) {
            library = libraries[0] as any;
        }

        return { count, nodes, isEmpty, first, last, file, folder, libraries, library };
    }
}
