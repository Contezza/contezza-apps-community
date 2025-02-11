import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { NGX_MONACO_EDITOR_CONFIG } from 'ngx-monaco-editor-v2';

import { JsConsoleStoreModule } from './store/store.module';

import { JsConsoleComponent } from './components/js-console/js-console.component';
import { NewJsConsoleService } from './services/js-console.service';

const routes: Routes = [
    {
        path: '',
        component: JsConsoleComponent,
    },
];

export const monacoEditorConfigFactory = (jsConsoleService: NewJsConsoleService) => jsConsoleService.getConfig();

@NgModule({
    imports: [RouterModule.forChild(routes), JsConsoleStoreModule],
    providers: [
        {
            provide: NGX_MONACO_EDITOR_CONFIG,
            useFactory: monacoEditorConfigFactory,
            deps: [NewJsConsoleService],
        },
    ],
})
export class JsConsoleModule {}
