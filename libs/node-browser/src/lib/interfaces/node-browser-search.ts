import { NBName } from './node-browser-name';

export interface NodeBrowserSearchParams {
    q: string;
    lang: NodeBrowserLang;
    store: string;
    maxResults: number;
}

export const nodeBrowserLangs = ['storeroot', 'noderef', 'xpath', 'lucene', 'fts-alfresco', 'cmis-strict', 'cmis-alfresco', 'db-afts', 'db-cmis'];
export type NodeBrowserLang = typeof nodeBrowserLangs[number];

export interface NodeBrowserSearchResponse {
    success: {
        numResults: number;
        searchElapsedTime: number;
        results: Array<InitialSearchResponseEntry>;
    };
    error: string;
}

export interface InitialSearchResponseEntry {
    name: NBName;
    nodeRef: string;
    qnamePath: NBName;
}
