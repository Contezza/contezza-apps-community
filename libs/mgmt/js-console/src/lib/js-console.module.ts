import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { NGX_MONACO_EDITOR_CONFIG } from '@contezza/third-party/monaco';

import { JsConsoleStoreModule } from './store/store.module';
import { JsConsoleMonacoEditorService } from './services/monaco-editor.service';

import { JsConsoleComponent } from './components/js-console/js-console.component';

const routes: Routes = [
    {
        path: '',
        component: JsConsoleComponent,
    },
];

export const monacoEditorConfigFactory = (monacoEditorService: JsConsoleMonacoEditorService) => monacoEditorService.getConfig();

@NgModule({
    imports: [RouterModule.forChild(routes), JsConsoleStoreModule],
    providers: [
        {
            provide: NGX_MONACO_EDITOR_CONFIG,
            useFactory: monacoEditorConfigFactory,
            deps: [JsConsoleMonacoEditorService],
        },
    ],
})
export class ContezzaJsConsoleModule {}
