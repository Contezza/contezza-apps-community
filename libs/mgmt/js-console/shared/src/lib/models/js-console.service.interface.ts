import { Observable } from 'rxjs';

/**
 * Public interface shared by all js-console services.
 */
export interface IJsConsoleService {
    check: () => string;
    endpoint: () => string;
    apiCommandsUrl: () => string;
    saveScriptUrl: () => string;
    saveNew: (payload, data) => Observable<{ scripts: Array<any>; created?: any }>;
    saveExisted: (payload) => Observable<any>;
    getConfig: () => object;
    onMonacoLoad;
}
