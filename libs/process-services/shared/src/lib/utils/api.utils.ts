import { ResultSetPaging } from '@alfresco/js-api';
import { SearchParameters } from '@contezza/content-services/search/shared';

export function tzPart() {
    const off = -new Date().getTimezoneOffset();
    const s = off >= 0 ? '+' : '-';
    const h = String(Math.floor(Math.abs(off) / 60)).padStart(2, '0');
    const m = String(Math.abs(off) % 60).padStart(2, '0');
    return `${s}${h}:${m}`;
}

export function dateAt(h = 23, m = 59, s = 59, ms = 999) {
    const d = new Date();
    d.setHours(h, m, s, ms);
    const yyyy = d.getFullYear();
    const MM = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const HH = String(d.getHours()).padStart(2, '0');
    const mm2 = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    const mss = String(d.getMilliseconds()).padStart(3, '0');
    return `${yyyy}-${MM}-${dd}T${HH}:${mm2}:${ss}.${mss} ${tzPart()}`;
}

export function parseSidebarQuery(sidebarQuery: string): Record<string, string> {
    return (sidebarQuery || '')
        .split(' AND ')
        .filter(Boolean)
        .reduce((acc, x) => {
            const [k, v] = x.split('=');
            if (k) acc[k] = v;
            return acc;
        }, {} as Record<string, string>);
}

export function toResultSet(type: 'task' | 'workflow', items: any[], paging?: any): ResultSetPaging {
    const entries = items.map((it) => ({ entry: { id: it.id, properties: {}, item: { ...it, type } } }));
    return { list: { entries, pagination: paging } } as unknown as ResultSetPaging;
}

export function clientSort<T>(data: T[], sorting: SearchParameters['sorting']) {
    const field = sorting?.field;
    if (!field) return;
    const asc = sorting?.ascending !== false;
    const path = field.split('.');
    const get = (o: any) => path.reduce((acc, k) => (acc ? acc[k] : undefined), o);
    data.sort((a: any, b: any) => {
        const av = get(a);
        const bv = get(b);
        if (av == null && bv == null) return 0;
        if (av == null) return asc ? 1 : -1;
        if (bv == null) return asc ? -1 : 1;
        const an = typeof av === 'number' ? av : String(av).toLowerCase();
        const bn = typeof bv === 'number' ? bv : String(bv).toLowerCase();
        if (an < bn) return asc ? -1 : 1;
        if (an > bn) return asc ? 1 : -1;
        return 0;
    });
}
