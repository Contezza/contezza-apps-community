import { Observable } from 'rxjs';

import { ResultSetPaging } from '@alfresco/js-api';

import { SearchParameters } from './search-parameters';

export type SearchTemplateParameters = { query: string } & {
    [K in keyof SearchParameters]: string;
};

export type SearchStrategy<TData = { template: (_: SearchTemplateParameters) => string; parameters: SearchParameters }> = (_: TData) => Observable<ResultSetPaging | undefined>;
