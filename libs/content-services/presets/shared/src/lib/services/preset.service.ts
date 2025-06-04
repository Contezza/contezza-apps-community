import { Injectable } from '@angular/core';

import { ContentApiService } from '@alfresco/aca-shared';
import { AppStore, getUserProfile } from '@alfresco/aca-shared/store';
import { AppConfigService, ObjectUtils } from '@alfresco/adf-core';
import { FileModel, NodesApiService, SearchService } from '@alfresco/adf-content-services';
import { ProfileState } from '@alfresco/adf-extensions';
import { Node, ResultNode, ResultSetPaging } from '@alfresco/js-api';

import { UploadService } from '@contezza/core/services';
import { ContezzaObservables, StringUtils } from '@contezza/core/utils';
import { DynamicFormDialogService } from '@contezza/dynamic-forms/dialog';
import { ContezzaDynamicForm, ContezzaDynamicSearchForm } from '@contezza/dynamic-forms/shared';

import { Store } from '@ngrx/store';

import { BehaviorSubject, map, Observable, of, shareReplay, switchMap, tap } from 'rxjs';
import { filter, take } from 'rxjs/operators';

import { PresetType, SavePresetPayload } from '../models';
import { DecoderService } from './decoder.service';

@Injectable({ providedIn: 'root' })
export class PresetService {
    private static readonly PRESET_PATH = 'nl.contezza.${storagePrefix}.${id}';
    private static readonly PRESET_PATH_SUB = PresetService.PRESET_PATH + '.${subId}';
    private static readonly PRESET_TEMPLATE = StringUtils.toTemplate(PresetService.PRESET_PATH);
    private static readonly PRESET_TEMPLATE_SUB = StringUtils.toTemplate(PresetService.PRESET_PATH_SUB);

    static readonly path = 'app:company_home/app:dictionary/app:saved_searches';

    presetNodes$: BehaviorSubject<ResultNode[]> = new BehaviorSubject<ResultNode[]>([]);

    private _savedSearchesFolderId$?: Observable<string>;
    private _userPresetFolderId$?: Observable<string>;

    private _userHomePath$?: Observable<string>;
    private _userHomeFolder$?: Observable<ResultNode>;

    constructor(
        private readonly search: SearchService,
        private readonly upload: UploadService,
        private readonly store: Store<AppStore>,
        private readonly appConfig: AppConfigService,
        private readonly contentApiService: ContentApiService,
        private readonly nodesApiService: NodesApiService,
        private readonly dialog: DynamicFormDialogService,
        private readonly decoder: DecoderService
    ) {}

    private get savedSearchesFolderId$(): Observable<string> {
        if (!this._savedSearchesFolderId$) {
            this._savedSearchesFolderId$ = this.search.searchByQueryBody({ query: { query: `PATH:"${PresetService.path}"` } }).pipe(
                map((response) => response.list.entries[0].entry.id),
                shareReplay(1)
            );
        }
        return this._savedSearchesFolderId$;
    }

    private get userPresetFolderId$(): Observable<string> {
        if (!this._userPresetFolderId$) {
            let parentId = '';
            this._userPresetFolderId$ = this.userHomeFolder$.pipe(
                tap((node) => {
                    parentId = node.id;
                }),
                switchMap((node) => this.contentApiService.getNodeChildren(node.id).pipe(map((nodePaging) => nodePaging.list.entries))),
                switchMap((entries) => {
                    if (!!entries && entries.length > 0) {
                        const savedSearchesFolder = entries.find((entry) => entry.entry.name === 'saved_searches');
                        if (!!savedSearchesFolder) {
                            return of(savedSearchesFolder.entry);
                        }
                    }
                    return this.createUserPresetFolder(parentId);
                }),
                map((node) => node.id)
            );
        }
        return this._userPresetFolderId$;
    }

    private get userHomePath$(): Observable<string> {
        if (!this._userHomePath$) {
            this._userHomePath$ = this.store.select(getUserProfile).pipe(
                map((profile: ProfileState) => (profile.id.includes('@') ? profile.id.replace('@', '_x0040_') : profile.id)),
                map((id) => (id === 'admin' ? 'PATH:"app:company_home' : `PATH:"app:company_home/app:user_homes/cm:${id}`)),
                shareReplay(1)
            );
        }
        return this._userHomePath$;
    }

    private get userHomeFolder$(): Observable<ResultNode> {
        if (!this._userHomeFolder$) {
            this._userHomeFolder$ = this.userHomePath$.pipe(
                map((path: string) => `${path}"`),
                switchMap((query: string) =>
                    this.search.searchByQueryBody({
                        query: {
                            query,
                            language: 'afts',
                        },
                    })
                ),
                map((response: ResultSetPaging) => response.list.entries[0].entry)
            );
        }
        return this._userHomeFolder$;
    }

    private get storagePrefix(): string {
        return this.appConfig.get('contezza.storagePrefix', '');
    }

    save(payload: SavePresetPayload): Observable<Node> {
        if ('nodeId' in payload && !!payload.nodeId) {
            return this.uploadPresetContent(true, payload.json, payload.nodeName, payload.nodeId);
        } else {
            const folderId$ = payload.global ? this.savedSearchesFolderId$ : this.userPresetFolderId$;

            return folderId$.pipe(switchMap((id) => this.uploadPresetContent(false, payload.json, payload.nodeName, id, payload.properties)));
        }
    }

    getPresetTitle$(currentTitle?: string): Observable<string> {
        return this.dialog
            .open({
                data: {
                    title: 'CONTENT_SERVICES.PRESETS.DIALOGS.SAVE_PRESET_DIALOG.TITLE',
                    dynamicFormId: {
                        id: 'content-services.presets.dynamic-forms.update-title-form',
                        providedDependencies: { currentTitle: of(currentTitle) },
                    },
                    buttons: { cancel: 'APP.BUTTONS.CANCEL', submit: 'APP.BUTTONS.OK' },
                },
                width: '400px',
            })
            .pipe(
                filter((response) => !!response),
                map(({ title }) => title)
            );
    }

    getPresetName(preferencesId: string): string {
        return `${this.storagePrefix}.${preferencesId}_preset-${Date.now()}.json`;
    }

    loadPresets(preferencesId: string): void {
        this.userHomePath$
            .pipe(
                map((path) => `${path}/cm:saved_searches//*"`),
                map(
                    (userHome) =>
                        `(PATH:"${PresetService.path}//*" OR ${userHome}) AND TYPE:"cm:content" AND content.mimetype:"application/json" AND cm:name:"${this.storagePrefix}.${preferencesId}*"`
                ),
                switchMap((query) =>
                    this.search
                        .searchByQueryBody({
                            query: { query, language: 'afts' },
                            include: ['path', 'properties'],
                        })
                        .pipe(map((response) => response.list.entries.map((entry) => entry.entry)))
                )
            )
            .subscribe((resultNodes) => this.presetNodes$.next(resultNodes ?? []));
    }

    loadPresetById(presetId: string, forms: Array<{ form: ContezzaDynamicSearchForm; type: PresetType }>, options: { preferencesId: string }): void {
        this.getContent(presetId)
            .pipe(
                filter((result) => !!result),
                map((value) => {
                    forms.forEach((form) => {
                        this.loadPreset(form.form, value, options.preferencesId, form.type);
                    });
                })
            )
            .subscribe();
    }

    getContent(id: string): Observable<any> {
        return this.nodesApiService.getNodeContent(id).pipe(
            switchMap((content) =>
                ContezzaObservables.fromEmitter<any>((emitter) => {
                    const reader = new FileReader();
                    reader.onload = () => emitter.next(JSON.parse(reader.result as string));
                    reader.readAsText(content);
                })
            ),
            take(1)
        );
    }

    loadPreset(form: ContezzaDynamicForm, preset: Record<string, string>, id: string, subId: string) {
        const presetPath = PresetService.PRESET_TEMPLATE_SUB({ storagePrefix: this.storagePrefix, id, subId });
        const formPreset = ObjectUtils.getValue(preset, presetPath);

        if (!!form && !!formPreset) {
            const decodedForm = this.decoder.decode(formPreset, form.rootField);
            form.reset('default');

            setTimeout(() => {
                Object.keys(decodedForm).forEach((key) => {
                    if (this.customSelectAll(key, decodedForm)) {
                        form?.form?.get(key)?.setValue(['*']);
                    } else if (!this.storeTypeFix(key, form, decodedForm)) {
                        form?.form?.get(key)?.setValue(decodedForm[key]);
                    }
                });
            }, 1000);
        }
    }

    getPresetPath(id: string) {
        return PresetService.PRESET_TEMPLATE({ storagePrefix: this.storagePrefix, id });
    }

    getPresetJson(forms: Array<{ form: ContezzaDynamicSearchForm; type: string }>, id: string): object {
        const presetPath = PresetService.PRESET_TEMPLATE({ storagePrefix: this.storagePrefix, id });
        const body = forms.reduce((acc, { form, type }) => {
            if (form) {
                acc[type] = this.decoder.encode(form.form.value, form.rootField);
            }
            return acc;
        }, {});

        return { [presetPath]: body };
    }

    private createUserPresetFolder(parentId: string): Observable<Node> {
        return this.nodesApiService.createFolder(parentId, {
            name: 'saved_searches',
            nodeType: 'cm:folder',
            properties: {},
        });
    }

    private uploadPresetContent(newVersion: boolean, presetJson: object, presetName: string, nodeId: string, properties?: any): Observable<Node> {
        const content = JSON.stringify(presetJson);

        const file = newVersion
            ? new FileModel(
                  new File([content], presetName),
                  {
                      majorVersion: false,
                      newVersion: true,
                  },
                  nodeId
              )
            : new FileModel(new File([content], presetName), {
                  majorVersion: false,
                  newVersion: false,
                  parentId: nodeId,
                  properties,
              });

        return this.upload.uploadFiles([file], { showInUploadDialog: false }).pipe(map((list) => list[0]!));
    }

    // fix for bug that when material radiobutton gets the same value with setValue() method it becomes empty
    private storeTypeFix(key: string, form: ContezzaDynamicForm, decodedForm: any): boolean {
        return key === 'storeType' && form?.form?.get(key)?.value?.label === decodedForm[key]?.label;
    }

    // customOption 'selectAll' in dynamic forms multiautocomplete fields
    private customSelectAll(key: string, decodedForm: any) {
        return Array.isArray(decodedForm[key]) && decodedForm[key].some((val: any) => val['0'] === '*');
    }
}
