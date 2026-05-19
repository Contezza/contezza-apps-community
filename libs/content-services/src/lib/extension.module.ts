import { NgModule } from '@angular/core';

import { Store } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { map, withLatestFrom } from 'rxjs';

import { Node } from '@alfresco/js-api';
import { provideTranslations, ThumbnailService as AdfThumbnailService } from '@alfresco/adf-core';
import { FileUploadStatus } from '@alfresco/adf-content-services';
import { ExtensionService as AdfExtensionService, provideExtensionConfig, RuleService } from '@alfresco/adf-extensions';

import { AdfUtils, ArrayUtils } from '@contezza/core/utils';
import { UploadFilterService } from '@contezza/core/extensions';
import { RuleContextService } from '@contezza/core/context';
import { showSnackbarInfo } from '@contezza/core/notifications';

import { ExtensionService, provideColumnComponents, ThumbnailService } from '@contezza/content-services/shared';

import { Effects } from './store/effects';

@NgModule({
    imports: [EffectsModule.forFeature([Effects])],
    providers: [
        provideTranslations('content-services', 'assets/content-services'),
        provideExtensionConfig([
            // meaningless comment to force items on multiple lines
            'content-services.actions.json',
            'content-services.dynamic-forms.json',
            'content-services.icons.json',
            'content-services.rules.json',
        ]),
        provideColumnComponents({
            'columns.dynamic-source': () => import('./components/columns/dynamic-source.column.component').then((_) => _.DynamicSourceColumnComponent),
        }),
    ],
})
export class ExtensionModule {
    constructor(
        store: Store,
        adfThumbnails: AdfThumbnailService,
        adfExtensions: AdfExtensionService,
        ruleService: RuleService,
        uploadFilter: UploadFilterService,
        ruleContext$: RuleContextService,
        extensions: ExtensionService,
        thumbnails: ThumbnailService
    ) {
        // content-services.selection.mimeTypeIn
        adfExtensions.setEvaluators(
            AdfUtils.makeRules(
                'mimeTypeIn',
                (node, context, mimeTypes: string[]) => {
                    const mimeType = node.content?.mimeType;
                    return !!mimeType && mimeTypes.includes(mimeType);
                },
                { prefix: ExtensionService.MODULE_ID }
            )
        );

        import('@contezza/content-services/components/metadata').then(c => adfExtensions.setComponents({ 'sidebar-tabs.metadata': c.MetadataSidebarTabComponent }));

        uploadFilter.addFilters({
            'content-services.search': (queue$) =>
                queue$.pipe(
                    withLatestFrom(ruleContext$),
                    map(([queue, context]) => {
                        const currentFolder = context.navigation.currentFolder;
                        // host components are used as currentFolder sometimes, therefore we must filter this case
                        if (currentFolder && 'aspectNames' in currentFolder) {
                            const canUploadFile = ruleService.evaluateRule('search-table-page.canUploadFile', context);
                            const canUploadFolder = ruleService.evaluateRule('search-table-page.canUploadFolder', context);
                            if (!canUploadFile || !canUploadFolder) {
                                // process all nodes with currentFolder as destination
                                const [folders, files] = ArrayUtils.partition(
                                    queue.filter((node) => node.status === UploadFilterService.FileUploadStatus.Processing && node.options.parentId === currentFolder.id),
                                    (node) => node.options.path !== ''
                                );
                                // cancel folders upload if not allowed
                                if (!canUploadFolder && folders.length) {
                                    folders.forEach((node) => (node.status = FileUploadStatus.Cancelled));
                                    store.dispatch(showSnackbarInfo({ payload: 'CONTENT_SERVICES.MESSAGES.INFO.FOLDER_UPLOAD_NOT_ALLOWED' }));
                                }
                                // cancel files upload if not allowed
                                if (!canUploadFile && files.length) {
                                    files.forEach((node) => (node.status = FileUploadStatus.Cancelled));
                                    store.dispatch(showSnackbarInfo({ payload: 'CONTENT_SERVICES.MESSAGES.INFO.FILE_UPLOAD_NOT_ALLOWED' }));
                                }
                            }
                        }
                        return queue;
                    })
                ),
        });

        extensions.setActions({
            'actions.column-editor': () => import('./components/actions/column-editor.action.component').then((_) => _.ColumnEditorActionComponent),
            'buttons.toggle-view': () => import('./components/actions/toggle-view.button.component').then((_) => _.ToggleViewButtonComponent),
        });
        extensions.setColumns({
            'columns.context-menu': () => import('./components/columns/context-menu.column.component').then((_) => _.ContextMenuColumnComponent),
            'columns.dynamic-form': () => import('./components/columns/dynamic-form.column.component').then((_) => _.DynamicFormColumnComponent),
            'columns.parent': () => import('./components/columns/parent.column.component').then((_) => _.ParentColumnComponent),
            'columns.site': () => import('./components/columns/site.column.component').then((_) => _.SiteColumnComponent),
            'columns.thumbnail': () => import('./components/columns/thumbnail/thumbnail.column.component').then((_) => _.ThumbnailColumnComponent),
        });

        thumbnails.setThumbnailIconResolvers<Node>({
            // generic fallback to default icons
            apply: (item) => adfThumbnails.getMimeTypeIcon(item.content?.mimeType || 'folder'),
            order: Number.MAX_SAFE_INTEGER,
        });
    }
}

export { ExtensionModule as ContentServicesExtensionModule };
