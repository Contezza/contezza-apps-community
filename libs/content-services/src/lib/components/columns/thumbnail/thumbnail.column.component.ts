import { ChangeDetectionStrategy, Component, OnInit, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatBadgeModule } from '@angular/material/badge';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { TranslateModule } from '@ngx-translate/core';

import { debounceTime, filter, map, Observable, of, switchMap, withLatestFrom } from 'rxjs';

import { RuleContextService, SelectionStore } from '@contezza/core/context';
import { IconDirective } from '@contezza/core/directives';
import { ColumnComponent, ThumbnailConfig, ThumbnailData, ThumbnailService } from '@contezza/content-services/shared';
import { SearchResultsService } from '@contezza/content-services/search/shared';

@Component({
    standalone: true,
    imports: [CommonModule, MatBadgeModule, MatIconModule, MatTooltipModule, TranslateModule, IconDirective],
    selector: 'contezza-thumbnail-column',
    templateUrl: 'thumbnail.column.component.html',
    styleUrls: ['thumbnail.column.component.scss'],
    host: {
        class: 'contezza-thumbnail-column',
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThumbnailColumnComponent<TItem> extends ColumnComponent<TItem, ThumbnailConfig | undefined> implements OnInit {
    isSelected$: Observable<boolean>;

    data$: Observable<ThumbnailData>;

    constructor(
        private readonly ruleContext$: RuleContextService,
        private readonly thumbnails: ThumbnailService,
        @Optional() private readonly selection?: SelectionStore<TItem>,
        @Optional() private readonly searchResultsService?: SearchResultsService
    ) {
        super();
    }

    ngOnInit() {
        this.isSelected$ = this.selection?.selected$(this.item) || of(false);
        this.data$ = this.ruleContext$.pipe(
            debounceTime(0),
            // block any update while searching, otherwise the thumbnail could display incorrect information due to mixed context
            withLatestFrom(this.searchResultsService?.searching$ || of(false)),
            filter(([, searching]) => !searching),
            map(([context]) => context),
            switchMap((context) => this.thumbnails.getThumbnailData(this.item, this.column.data, context))
        );
    }
}
