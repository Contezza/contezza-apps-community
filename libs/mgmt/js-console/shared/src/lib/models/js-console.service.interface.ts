import { ConsoleScript } from '../../../../src/lib/interfaces/js-console';

/**
 * Public interface shared by all js-console services.
 */
// TODO: fill this in with all methods which differ between legacy and ootb.
export interface IJsConsoleService {
    check: () => string;
    endpoint: () => string;
    apiCommandsUrl: () => string;
    saveScriptUrl: () => string;
    saveNew: () => { scripts: Array<ConsoleScript>; created?: ConsoleScript };
    saveExisted: () => any;
    onMonacoLoad: () => any;
}
