# Contezza Javascript Console

## Contezza Javascript Console Shared

See [readme](./shared/README.md).

## Contezza Javascript Console Module

Define route:
```ts
{
    path: 'javascript-console',
    loadChildren: () => import('@contezza/js-console').then((m) => m.JsConsoleModule)
}
```

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
    },
    {
        "input": "node_modules/monaco-editor/min",
        "output": "./assets/monaco/min",
        "glob": "**/*"
    },
    {
        "input": "node_modules/monaco-editor/min-maps",
        "output": "./assets/monaco/min-maps",
        "glob": "**/*"
    }
]
```

Navbar extension element:
```json
{
    "id": "contezza.js-console",
    "icon": "svg:console",
    "title": "CONTEZZA.JS_CONSOLE.NAVBAR.TITLE",
    "description": "CONTEZZA.JS_CONSOLE.NAVBAR.DESCRIPTION",
    "route": "javascript-console"
}
```

