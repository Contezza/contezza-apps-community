import { ConsoleScript } from '../../../../src/lib/interfaces/js-console';
import { Observable } from 'rxjs';

/**
 * Public interface shared by all js-console services.
 */
export interface IJsConsoleService {
    check: () => string;
    endpoint: () => string;
    apiCommandsUrl: () => string;
    saveScriptUrl: () => string;
    saveNew: (payload, data) => Observable<{ scripts: Array<ConsoleScript>; created?: ConsoleScript }>;
    saveExisted: (payload) => Observable<any>;
    getConfig: () => object;
    onMonacoLoad;
}
