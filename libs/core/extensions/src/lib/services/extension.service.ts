import { Inject, Injectable, InjectionToken, Injector } from '@angular/core';

import { BehaviorSubject, forkJoin, from, Observable, of, timer } from 'rxjs';
import { debounce, map, share, switchMap, take, tap } from 'rxjs/operators';

import {
    ComponentRegisterService,
    EXTENSION_JSONS,
    ExtensionConfig,
    ExtensionLoaderService,
    ExtensionService,
    mergeObjects,
    RuleContext,
    RuleService,
} from '@alfresco/adf-extensions';

import { Utils } from '../utils';
import { ContezzaDynamicExtensionService } from './dynamic-extension.service';

const EXTENSION_QUERIES = new InjectionToken<string[][]>('extension-queries', {
    providedIn: 'root',
    factory: () => [],
});

export const provideExtensionQueries = (queries: string[]) => ({
    provide: EXTENSION_QUERIES,
    useValue: queries,
    multi: true,
});

@Injectable()
export class ContezzaExtensionService extends ExtensionService {
    private configFromAssets: ExtensionConfig;
    private configFromRepository: ExtensionConfig;

    private readonly loadTrigger = new BehaviorSubject<void>(undefined);
    private readonly config$: Observable<ExtensionConfig> = this.loadTrigger.asObservable().pipe(
        // higher debounce time by initialization, to capture first login
        debounce(() => (!this.config ? timer(500) : of({}))),
        switchMap(() =>
            forkJoin([
                !this.configFromAssets
                    ? from(this.loader.load(this.configPath, this.pluginsPath, this.extensionJsons.flat())).pipe(
                          tap((configFromAssets) => (this.configFromAssets = configFromAssets))
                      )
                    : of(this.configFromAssets),
                !this.configFromRepository
                    ? this.dynamicExtensionService.load(this.extensionQueries.flat()).pipe(tap((configFromRepository) => (this.configFromRepository = configFromRepository)))
                    : of(this.configFromRepository),
            ])
        ),
        map(([configFromAssets, configFromRepository]) => (configFromRepository ? mergeObjects(configFromAssets, configFromRepository) : configFromAssets)),
        share()
    );

    get dynamicExtensionService(): ContezzaDynamicExtensionService {
        return this.injector.get(ContezzaDynamicExtensionService);
    }

    constructor(
        private readonly injector: Injector,
        @Inject(EXTENSION_QUERIES) private extensionQueries: string[][],
        loader: ExtensionLoaderService,
        componentRegister: ComponentRegisterService,
        ruleService: RuleService,
        @Inject(EXTENSION_JSONS) extensionJsons: string[]
    ) {
        super(loader, componentRegister, ruleService, extensionJsons);
    }

    /**
     * Loads and registers an extension config file and plugins (specified by path properties).
     * Extends default extension loading by retrieving extra extension files from the repository.
     *
     * @returns The loaded config data
     */
    async load(): Promise<ExtensionConfig> {
        this.loadTrigger.next();
        const config = await this.config$.pipe(take(1)).toPromise();
        Utils.resolveImports(config);
        this.setup(config);
        return config;
    }

    evaluateRule(ruleId: string, context?: RuleContext): boolean {
        try {
            return super.evaluateRule(ruleId, context);
        } catch (e) {
            console.warn(e);
            return false;
        }
    }
}
