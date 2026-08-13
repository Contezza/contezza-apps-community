import { inject, Injectable } from '@angular/core';

import { BehaviorSubject, filter, map, Observable, of, shareReplay, switchMap, take } from 'rxjs';

import { UserProfileService } from '@alfresco/aca-shared';
import { FileModel, NodesApiService, SearchService } from '@alfresco/adf-content-services';
import { AppConfigService, ObjectUtils } from '@alfresco/adf-core';
import { ProfileState } from '@alfresco/adf-extensions';
import { Node, ResultNode } from '@alfresco/js-api';

import { UploadService } from '@contezza/core/services';
import { ContezzaObservables, StringUtils } from '@contezza/core/utils';

import { DynamicFormDialogService } from '@contezza/dynamic-forms/dialog';
import { ContezzaDynamicForm, ContezzaDynamicSearchForm } from '@contezza/dynamic-forms/shared';

import { PresetType, SavePresetPayload } from '../models';
import { DecoderService } from './decoder.service';

@Injectable({ providedIn: 'root' })
export class PresetService {
    private static readonly PRESET_PATH = 'nl.contezza.${storagePrefix}.${id}';
    private static readonly PRESET_PATH_SUB = PresetService.PRESET_PATH + '.${subId}';
    private static readonly PRESET_TEMPLATE = StringUtils.toTemplate(PresetService.PRESET_PATH);
    private static readonly PRESET_TEMPLATE_SUB = StringUtils.toTemplate(PresetService.PRESET_PATH_SUB);

    static readonly path = 'app:company_home/app:dictionary/app:saved_searches';

    // constructor
    private readonly search = inject(SearchService);
    private readonly upload = inject(UploadService);
    private readonly appConfig = inject(AppConfigService);
    private readonly nodesApiService = inject(NodesApiService);
    private readonly userProfileService = inject(UserProfileService);
    private readonly dialog = inject(DynamicFormDialogService);
    private readonly decoder = inject(DecoderService);

    presetNodes$: BehaviorSubject<ResultNode[]> = new BehaviorSubject<ResultNode[]>([]);

    private _savedSearchesFolderId$?: Observable<string>;
    private _userPresetFolderId$?: Observable<string>;

    private _userHomePath$?: Observable<string>;

    private get savedSearchesFolderId$(): Observable<string> {
        if (!this._savedSearchesFolderId$) {
            this._savedSearchesFolderId$ = this.search.searchByQueryBody({ query: { query: `PATH:"${PresetService.path}"` } }).pipe(
                map(response => response.list.entries[0].entry.id),
                shareReplay({ bufferSize: 1, refCount: true }),
            );
        }
        return this._savedSearchesFolderId$;
    }

    private get userPresetFolderId$(): Observable<string> {
        if (!this._userPresetFolderId$) {
            this._userPresetFolderId$ = this.userHomePath$.pipe(
                switchMap((path: string) =>
                    this.search
                        .searchByQueryBody({
                            query: {
                                query: `${path}/cm:saved_searches"`,
                                language: 'afts',
                            },
                        })
                        .pipe(
                            switchMap(savedSearchFolderResponse => {
                                const savedSearchFolder = savedSearchFolderResponse.list.entries[0]?.entry;
                                return savedSearchFolder
                                    ? of(savedSearchFolder)
                                    : this.search
                                          .searchByQueryBody({
                                              query: {
                                                  query: `${path}"`,
                                                  language: 'afts',
                                              },
                                          })
                                          .pipe(
                                              switchMap(parentFolderResponse => {
                                                  const parentFolder = parentFolderResponse.list.entries[0]?.entry;
                                                  if (!parentFolder) {
                                                      throw new Error('User home folder not found');
                                                  }
                                                  return this.createUserPresetFolder(parentFolder.id);
                                              }),
                                          );
                            }),
                        ),
                ),
                map(node => node.id),
                shareReplay({ bufferSize: 1, refCount: true }),
            );
        }
        return this._userPresetFolderId$;
    }

    private get userHomePath$(): Observable<string> {
        if (!this._userHomePath$) {
            this._userHomePath$ = this.userProfileService.userProfile$.pipe(
                take(1),
                map((profile: ProfileState) => (profile.id.includes('@') ? profile.id.replace('@', '_x0040_') : profile.id)),
                map(id => (id === 'admin' ? 'PATH:"app:company_home' : `PATH:"app:company_home/app:user_homes/cm:${id}`)),
                shareReplay({ bufferSize: 1, refCount: true }),
            );
        }
        return this._userHomePath$;
    }

    private get storagePrefix(): string {
        return this.appConfig.get('contezza.storagePrefix', '');
    }

    save(payload: SavePresetPayload): Observable<Node> {
        if ('nodeId' in payload && !!payload.nodeId) {
            return this.uploadPresetContent(true, payload.json, payload.nodeName, payload.nodeId);
        } else {
            const folderId$ = payload.global ? this.savedSearchesFolderId$ : this.userPresetFolderId$;

            return folderId$.pipe(switchMap(id => this.uploadPresetContent(false, payload.json, payload.nodeName, id, payload.properties)));
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
                autoFocus: false,
                width: '400px',
                height: '250px',
            })
            .pipe(
                filter(response => !!response),
                map(({ title }) => title),
            );
    }

    getPresetName(preferencesId: string): string {
        return `${this.storagePrefix}.${preferencesId}_preset-${Date.now()}.json`;
    }

    loadPresets(preferencesId: string): void {
        this.userHomePath$
            .pipe(
                map(path => `${path}/cm:saved_searches//*"`),
                map(
                    userHome =>
                        `(PATH:"${PresetService.path}//*" OR ${userHome}) AND TYPE:"cm:content" AND content.mimetype:"application/json" AND cm:name:"${this.storagePrefix}.${preferencesId}*"`,
                ),
                switchMap(query =>
                    this.search
                        .searchByQueryBody({
                            query: { query, language: 'afts' },
                            include: ['path', 'properties'],
                        })
                        .pipe(map(response => response.list.entries.map(entry => entry.entry))),
                ),
            )
            .subscribe(resultNodes => this.presetNodes$.next(resultNodes ?? []));
    }

    loadPresetById(presetId: string, forms: Array<{ form: ContezzaDynamicSearchForm; type: PresetType }>, options: { preferencesId: string }): void {
        this.getContent(presetId)
            .pipe(
                filter(result => !!result),
                map(value => {
                    forms.forEach(form => {
                        this.loadPreset(form.form, value, options.preferencesId, form.type);
                    });
                }),
            )
            .subscribe();
    }

    getContent(id: string): Observable<any> {
        return this.nodesApiService.getNodeContent(id).pipe(
            switchMap(content =>
                ContezzaObservables.fromEmitter<any>(emitter => {
                    const reader = new FileReader();
                    reader.onload = () => emitter.next(JSON.parse(reader.result as string));
                    reader.readAsText(content);
                }),
            ),
            take(1),
        );
    }

    loadPreset(form: ContezzaDynamicForm, preset: Record<string, string>, id: string, subId: string) {
        const presetPath = PresetService.PRESET_TEMPLATE_SUB({ storagePrefix: this.storagePrefix, id, subId });
        const formPreset = ObjectUtils.getValue(preset, presetPath);

        if (!!form && !!formPreset) {
            const decodedForm = this.decoder.decode(formPreset, form.rootField);
            form.reset('default');

            setTimeout(() => {
                Object.keys(decodedForm).forEach(key => {
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
                  nodeId,
              )
            : new FileModel(new File([content], presetName), {
                  majorVersion: false,
                  newVersion: false,
                  parentId: nodeId,
                  path: '',
                  properties,
              });

        return this.upload.uploadFiles([file], { showInUploadDialog: false }).pipe(map(list => list[0]!));
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
