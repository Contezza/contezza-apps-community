## Contezza Javascript Console

**Include library**

```ts 
import { ContezzaJsConsoleExtensionModule } from '@contezza/mgmt/js-console-extensions';
```

**Add route**
```ts
{
   path: 'javascript-console',
   loadChildren: () => import('../../../../../libs/mgmt/js-console/src/lib/js-console.module').then((m) => m.ContezzaJsConsoleModule)
}
```

**Add assets in angular.json:**

```json
{
    "glob": "*.json",
    "input": "libs/mgmt/js-console/extensions",
    "output": "./assets/plugins"
},
{
   "glob": "**/*",
   "input": "libs/mgmt/js-console/assets",
   "output": "./assets/mgmt/js-console"
},
{
   "glob": "**/*",
   "input": "node_modules/ngx-monaco-editor/assets/monaco",
   "output": "./assets/monaco/"
}
```

**Include javascript console in navbar**
```json
{
    "id": "app.console.js-console.component",
    "order": 100,
    "icon": "svg:console",
    "title": "APP.JS_CONSOLE.NAVBAR.TITLE",
    "description": "APP.JS_CONSOLE.NAVBAR.DESCRIPTION",
    "route": "javascript-console"
}
```

**Open in javascript console action:**
```json
{
    "id": "app.context.menu.openInJavascriptConsole",
    "title": "APP.JS_CONSOLE.ACTIONS.OPEN_IN_CONSOLE",
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
> - svg:language-javascript
> - svg:backburger
> - svg:forwardburger
> - svg:content-save-edit-outline
> - svg:dark_mode
> - svg:light_mode


**Available evaluators:**
> - jsconsole.selection.canOpenInJavascriptConsole

