import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Store } from '@ngrx/store';

import { map, Observable, of } from 'rxjs';

import { Node, PathElement } from '@alfresco/js-api';

import { navigateToFolder } from '@contezza/core/actions';
import { SiteTitlesService } from '@contezza/core/services';

import { ColumnComponent } from '@contezza/content-services/shared';

@Component({
    standalone: true,
    imports: [CommonModule],
    selector: 'contezza-parent-column',
    template: `<span *ngIf="parent$ | async as parent" role="link" [title]="parent.name" (click)="onClick(parent)">{{ parent.name }}</span>`,
    styles: [
        `
            :host:hover {
                text-decoration: underline;
            }
        `,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParentColumnComponent extends ColumnComponent<Node> implements OnInit {
    parent$!: Observable<PathElement | undefined>;

    constructor(private readonly store: Store, private readonly siteTitles: SiteTitlesService) {
        super();
    }

    ngOnInit() {
        this.initParent();
    }

    onClick(parent: PathElement) {
        this.store.dispatch(navigateToFolder({ payload: { entry: parent as Node } }));
    }

    private initParent() {
        const pathElements = this.item.path?.elements;
        if (pathElements) {
            const parent = pathElements.at(-1);
            if (parent) {
                // if the parent is a document library, then show the site title instead of 'documentLibrary'
                if (parent.aspectNames.includes('st:siteContainer') && parent.name === 'documentLibrary') {
                    const sitePathElement = pathElements.at(-2);
                    this.parent$ = this.siteTitles.getTitle({ id: sitePathElement.name }).pipe(
                        map((title) => {
                            parent.name = title;
                            return parent;
                        })
                    );
                } else {
                    this.parent$ = of(parent);
                }
            } else {
                this.parent$ = of(undefined);
            }
        } else {
            this.parent$ = of(undefined);
        }
    }
}
