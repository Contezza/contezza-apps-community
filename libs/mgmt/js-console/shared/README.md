# Contezza Javascript Console Shared

Import in root module:
```ts 
import { JsConsoleExtensionModule } from '@contezza/js-console/shared';

const jsConsolePath = 'javascript-console';

@NgModule({
    imports: [
        JsConsoleExtensionModule.withConfig({ path: jsConsolePath })
    ]
})
export class AppModule {}
```

Constant `jsConsolePath` defines the route used for the 'Open in Javascript Console' action and must match the route where `JsConsoleModule` is loaded.

Assets:
```json
[

    {
        "input": "node_modules/@contezza/js-console/assets/extensions",
        "output": "./assets/plugins",
        "glob": "*.json"
    },
    {
        "input": "node_modules/@contezza/js-console/assets",
        "output": "./assets/js-console",
        "glob": "**/*"
    }
]
```

## Actions

Effects for the following `rxjs` actions are defined.

| TYPE                   | DESCRIPTION                    | 
|------------------------|--------------------------------|
| `[JS_CONSOLE] OPEN_NODE` | Opens the selected node in Javascript Console. 

## Extension elements

Action templates:

| ID                   | ACTION TYPE | RULE | IMPORTED IN           |
|------------------------|-------------|-----|-----------------------|
| `contezza.js-console.open-node` | `[JS_CONSOLE] OPEN_NODE`            | `contezza.js-console.canOpenNode`    | Context menu, toolbar |

Rules:

| ID                   | EVALUATOR                              | 
|------------------------|----------------------------------------|
| `contezza.js-console.canOpenNode` | `user.isAdmin && app.selection.single` |

Icons:

| ID                   | PREVIEW                                                | 
|------------------------|--------------------------------------------------------|
| `svg:console` | ![img](../assets/images/console.svg)                   |
| `svg:backburger` | ![img](../assets/images/backburger.svg)                |
| `svg:forwardburger` | ![img](../assets/images/forwardburger.svg)             |
| `svg:content-save-edit-outline` | ![img](../assets/images/content-save-edit-outline.svg) |
| `svg:dark_mode` | ![img](../assets/images/dark_mode.svg)                 |
| `svg:light_mode` | ![img](../assets/images/light_mode.svg)                |

## OOTB and Legacy JS console

Needs `"@contezza/js-console": "2.11.2"` or higher.

It is possible to use different modules of the javascript console with an app. We have implemented the Order of the Bee Javascript Console and the Legacy JS console. The Contezza Apps Community library uses the legacy console as the standard. If you want to use the OOTB JS console you need to implement the following code in your app. 

extensions.module.ts
```
import { JsConsoleExtensionModule, ServiceKey } from '@contezza/js-console/shared';

const jsConsole = config?.jsConsole;
const getServiceKey = () => (jsConsole.service === 'legacy' ? ServiceKey.LEGACY : ServiceKey.OOTB);

@NgModule({
    imports: [
        JsConsoleExtensionModule.withConfig({ service: getServiceKey() }),

    ]
})
```

app.config.js
```
var config = {
    jsConsole: { service: 'ootb' },
};
```