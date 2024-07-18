import { Inject, Injectable, Optional } from '@angular/core';

import { EXTENSION_CONFIG, ExtensionConfig, IJsConsoleService, ServiceKey } from '@contezza/js-console/shared';

import { Registry } from './registry';
import { ConsoleScript } from '../interfaces/js-console';

// TODO: remove JsConsoleService from console.service.ts, rename this
@Injectable({ providedIn: 'root' })
export class NewJsConsoleService implements IJsConsoleService {
    private _service?: IJsConsoleService;
    private get service() {
        return (this._service ??= this.registry.get(this.config.service || ServiceKey.LEGACY));
    }

    constructor(private readonly registry: Registry, @Inject(EXTENSION_CONFIG) @Optional() private readonly config?: ExtensionConfig) {}

    // TODO: literally copy paste this for each method in the interface
    check(): string {
        return this.service.check();
    }

    endpoint(): string {
        return this.service.endpoint();
    }

    apiCommandsUrl(): string {
        return this.service.apiCommandsUrl();
    }

    saveScriptUrl(): string {
        return this.service.saveScriptUrl();
    }

    saveNew(): { scripts: Array<ConsoleScript>; created?: ConsoleScript } {
        return this.service.saveNew();
    }

    saveExisted(): any {
        return this.service.saveExisted();
    }

    onMonacoLoad(): any {
        return this.service.onMonacoLoad();
    }
}
