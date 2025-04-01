import { Directive, Input, Output } from '@angular/core';

import { Observable, switchMap } from 'rxjs';

import { DynamicComponent } from '@contezza/core/dynamic-component';
import { ISearchResultPreview } from '@contezza/content-services/search/shared';

@Directive({
    standalone: true,
    // eslint-disable-next-line @angular-eslint/directive-selector
    selector: 'contezza-dynamic-component[contezza-search-result-preview]',
})
export class SearchResultPreviewDirective<TItem> {
    private readonly componentReady$: Observable<ISearchResultPreview<TItem>> = this.host.componentReady$;

    @Input()
    set result(result: TItem) {
        this.componentReady$.subscribe((component) => (component.result = result));
    }

    @Output()
    // eslint-disable-next-line @angular-eslint/no-output-native
    readonly close = this.componentReady$.pipe(switchMap((component) => component.close));

    constructor(private readonly host: DynamicComponent<any>) {}
}
