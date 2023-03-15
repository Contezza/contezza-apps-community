import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TranslateModule } from '@ngx-translate/core';

import { PageLayoutModule } from '@alfresco/aca-shared';
import { BreadcrumbModule } from '@alfresco/adf-content-services';
import { IconModule, PipeModule, ToolbarModule } from '@alfresco/adf-core';

import { ContezzaLetModule } from '@contezza/core/directives';
import { ContezzaSearchFormComponent } from '@contezza/search/form';
import { MonacoEditorModule, NGX_MONACO_EDITOR_CONFIG } from '@contezza/third-party/monaco';

import { JsConsoleStoreModule } from './store/store.module';
import { JsConsoleMaterialModule } from './js-console-material.module';

import { JsConsoleSanitizeHtmlPipe } from './pipes/sanitize-html.pipe';
import { JsConsoleResizeDirective } from './directives/resize.directive';
import { JsConsoleMonacoEditorService } from './services/monaco-editor.service';

import { JsConsoleComponent } from './components/js-console/js-console.component';
import { JsConsoleOutputComponent } from './components/js-console-output/js-console-output.component';
import { JsConsoleHeaderComponent } from './components/js-console-header/js-console-header.component';
import { JsConsoleContentComponent } from './components/js-console-content/js-console-content.component';
import { JsConsoleOutputJsComponent } from './components/js-console-output/js/js-console-output-js.component';
import { JsConsoleOutputDumpComponent } from './components/js-console-output/dump/js-console-output-dump.component';
import { JsConsoleContentExecutionParamsComponent } from './components/js-console-content/execution-params/js-console-content-execution-params.component';
import { JsConsoleScriptsListComponent } from './components/js-console-scripts-list/js-console-scripts-list.component';
import { JsConsoleNoderefComponent } from './components/js-console-header/noderef/js-console-noderef.component';

const routes: Routes = [
    {
        path: '',
        component: JsConsoleComponent,
    },
];

export const monacoEditorConfigFactory = (monacoEditorService: JsConsoleMonacoEditorService) => monacoEditorService.getConfig();

@NgModule({
    imports: [
        CommonModule,
        TranslateModule,
        PageLayoutModule,
        PageLayoutModule,
        RouterModule.forChild(routes),
        MonacoEditorModule.forRoot({}),
        FormsModule,
        ReactiveFormsModule,
        BreadcrumbModule,
        ToolbarModule,
        IconModule,
        PipeModule,
        ContezzaLetModule,
        ContezzaSearchFormComponent,
        JsConsoleMaterialModule,
        JsConsoleStoreModule,
    ],
    declarations: [
        JsConsoleComponent,
        JsConsoleOutputComponent,
        JsConsoleHeaderComponent,
        JsConsoleContentComponent,
        JsConsoleOutputJsComponent,
        JsConsoleOutputDumpComponent,
        JsConsoleSanitizeHtmlPipe,
        JsConsoleContentExecutionParamsComponent,
        JsConsoleScriptsListComponent,
        JsConsoleNoderefComponent,
        JsConsoleResizeDirective,
    ],
    providers: [
        {
            provide: NGX_MONACO_EDITOR_CONFIG,
            useFactory: monacoEditorConfigFactory,
            deps: [JsConsoleMonacoEditorService],
        },
    ],
})
export class ContezzaJsConsoleModule {}
