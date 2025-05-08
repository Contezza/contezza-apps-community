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
    selector: 'contezza-site-column',
    template: `<span *ngIf="site$ | async as site" role="link" [title]="site.name" (click)="onClick(site)">{{ site.name }}</span>`,
    styles: [
        `
            :host:hover {
                text-decoration: underline;
            }
        `,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteColumnComponent extends ColumnComponent<Node> implements OnInit {
    site$!: Observable<PathElement | undefined>;

    constructor(private readonly store: Store, private readonly siteTitles: SiteTitlesService) {
        super();
    }

    ngOnInit() {
        const site = this.getSite(this.item);
        this.site$ = site
            ? this.siteTitles.getTitle({ id: site.name }).pipe(
                  map((title) => {
                      // show site title instead of its name
                      site.name = title;
                      return site;
                  })
              )
            : of(undefined);
    }

    onClick(site: PathElement) {
        this.store.dispatch(navigateToFolder({ payload: { entry: site as Node } }));
    }

    private getSite({ path }: Node): PathElement | undefined {
        return path?.elements?.find((el) => el.nodeType === 'st:site');
    }
}
