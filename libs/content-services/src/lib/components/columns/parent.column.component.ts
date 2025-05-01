import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Store } from '@ngrx/store';

import { Node, PathElement } from '@alfresco/js-api';

import { navigateToFolder } from '@contezza/core/actions';

import { ColumnComponent } from '@contezza/content-services/shared';

@Component({
    standalone: true,
    imports: [CommonModule],
    selector: 'contezza-parent-column',
    template: `<span *ngIf="parent" role="link" class="adf-datatable-cell-value" title="{{ parent.name }}" (click)="onClick()">{{ parent.name }}</span>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'adf-datatable-content-cell adf-datatable-link adf-name-column aca-custom-name-column',
    },
})
export class ParentColumnComponent extends ColumnComponent<Node> implements OnInit {
    parent?: PathElement;

    constructor(private readonly store: Store) {
        super();
    }

    ngOnInit() {
        this.parent = this.getParent(this.item);
    }

    onClick() {
        this.store.dispatch(navigateToFolder({ payload: { entry: this.parent as Node } }));
    }

    private getParent({ path }: Node): PathElement | undefined {
        if (path) {
            const { elements } = path;
            const lastElement = elements[elements.length - 1];
            if (this.isFolderType(lastElement.nodeType)) {
                return lastElement;
            }
        }
        return undefined;
    }

    private isFolderType(type: string): boolean {
        return ['cm', 'st', 'rma'].some((prefix) => type.startsWith(prefix + ':'));
    }
}
