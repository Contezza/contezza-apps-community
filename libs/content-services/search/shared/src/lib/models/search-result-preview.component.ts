import { Observable } from 'rxjs';

export interface ISearchResultPreview<TItem> {
    result: TItem;
    close: Observable<void>;
}
