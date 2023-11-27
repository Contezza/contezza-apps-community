## Contezza Javascript Console

**Include library**

```ts 
import { JsConsoleExtensionModule } from '@contezza/js-console/shared';
```

**Add route**
```ts
{
    path: 'javascript-console',
    loadChildren: () => import('@contezza/js-console').then((m) => m.JsConsoleModule)
}
```

**Add assets in angular.json:**

```json
[
    {
        "input": "libs/mgmt/js-console/assets/extensions",
        "output": "./assets/plugins",
        "glob": "*.json"
    },
    {
        "input": "libs/mgmt/js-console/assets",
        "output": "./assets/js-console",
        "glob": "**/*"
    },
    {
        "glob": "**/*",
        "input": "node_modules/ngx-monaco-editor/assets/monaco",
        "output": "./assets/monaco/"
    }
]
```

**Include javascript console in navbar**
```json
{
    "id": "app.console.js-console.component",
    "order": 100,
    "icon": "svg:console",
    "title": "CONTEZZA.JS_CONSOLE.NAVBAR.TITLE",
    "description": "CONTEZZA.JS_CONSOLE.NAVBAR.DESCRIPTION",
    "route": "javascript-console"
}
```

**Open in javascript console action:**
```json
{
    "id": "app.context.menu.openInJavascriptConsole",
    "title": "CONTEZZA.JS_CONSOLE.ACTIONS.OPEN_IN_CONSOLE",
    "order": 900,
    "icon": "svg:console",
    "actions": {
        "click": "[JS CONSOLE] OPEN_IN_JAVASCRIPT_CONSOLE"
    },
    "rules": {
        "visible": "jsconsole.selection.canOpenInJavascriptConsole"
    }
}
```

**Available icons:**
> - svg:console
> - svg:backburger
> - svg:forwardburger
> - svg:content-save-edit-outline
> - svg:dark_mode
> - svg:light_mode



