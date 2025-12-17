import { ResultSetPaging } from '@alfresco/js-api';

export function toResultSet(items: any[], paging?: any): ResultSetPaging {
    const entries = items.map((it) => ({ entry: it }));
    return { list: { entries, pagination: paging } } as unknown as ResultSetPaging;
}
