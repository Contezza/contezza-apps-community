import { Inject, Injectable, Optional } from '@angular/core';

import { EXTENSION_CONFIG, ExtensionConfig, IJsConsoleService, ServiceKey } from '@contezza/js-console/shared';

import { Registry } from './registry';
import { ConsoleScript } from '../interfaces/js-console';
import { Observable } from 'rxjs';

// TODO: remove JsConsoleService from console.service.ts, rename this
@Injectable({ providedIn: 'root' })
export class NewJsConsoleService implements IJsConsoleService {
    private _service?: IJsConsoleService;
    private get service() {
        return (this._service ??= this.registry.get(this.config.service || ServiceKey.LEGACY));
    }

    constructor(private readonly registry: Registry, @Inject(EXTENSION_CONFIG) @Optional() private readonly config?: ExtensionConfig) {}

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

    saveNew(payload, data): Observable<{ scripts: Array<ConsoleScript>; created?: ConsoleScript }> {
        return this.service.saveNew(payload, data);
    }

    saveExisted(payload): Observable<any> {
        return this.service.saveExisted(payload);
    }

    getConfig(): object {
        return this.service.getConfig();
    }

    onMonacoLoad(): void {
        this.service.onMonacoLoad();
    }
}
