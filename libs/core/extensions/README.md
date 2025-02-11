# @contezza/core/extensions

Secondary entry point of `@contezza/core`. It can be used by importing from `@contezza/core/extensions`.

## Extension configuration

The extension configuration is built when the app starts by merging all the extension files following [these rules](https://alfresco-content-app.netlify.app/#/extending/extension-format).
Service `ContezzaExtensionService` extends these rules by defining two injection tokens and the corresponding providers.

### Extension queries

Using `provideExtensionQueries` (token `EXTENSION_QUERIES`) it is possible to retrieve extension files from the DMS and to use them, together with all extension files from the app assets, to build the app extension configuration. It takes as parameter an array of queries, e.g.

```ts
provideExtensionQueries(['PATH:"app:company_home/app:dictionary//*" AND TYPE:"cm:content" AND content.mimetype:"application/json"'])
```

### Extension processors

Using `provideExtensionProcessors` (token `EXTENSION_PROCESSORS`) it is possible to define functions to be applied to the extension configuration. These functions are applied after all extension files are merged but before imports (see paragraph below) are resolved. It takes as parameter an array of `void`-valued functions, e.g.
```ts
provideExtensionProcessors([(config) => console.log(config)])
```

## Imports

Extensions support `imports`. Each extension object can have an `imports` property, of type `string | string[]`. Each import must refer to another extension object. The following format is supported:
```
features.toolbar[app.toolbar.more].children[{"id":"app.toolbar.copy"}]
```

An object with the `imports` property inherits all properties of the imported object, with own properties having priority by conflicts.
Imports may have the tag `!important`, in this case their properties have priority above the properties of the importing object. Format is:
```
features.toolbar[app.toolbar.more].children[{"id":"app.toolbar.copy"}]!important
```
An object may have important and not important `imports` at the same time.

N.B.:
* Imports can also be nested, in this case they are processed in the correct order.
* Circular dependencies are detected and throw errors.

Each import can also define a list of replacers, an id prefix and a script. Note that these are applied in this order. The full import interface is
```
interface Import {
   id: string;
   replace?: { replaced: string; replacer: any }[];
   prefixIds?: string;
   script?: string;
}
```
and the property `imports` has type
```
string | Import | (string | Import)[]
```
allowing to mix imports with and without these optional properties.

### Replacers

If an object is imported and replacers are defined, then a replace operation is performed (replace `replaced` with `replacer`) on each object property of type `string`.

N.B.:
* The same replacer can be applied multiple times in multiple properties of the imported object.
* The same object can be imported multiple times with different replacers.

### Id prefix

If an object is imported and an id prefix is defined, then this prefix is applied to each `id` (sub)property.

### Script

A script is a stringified javascript function which takes the imported object as argument and returns no value.
If an object is imported and a script is defined, then the script is parsed and applied to the imported object.

## Route Extensions

Service `RouterExtensionService` extends the homonymous service from `@alfresco/aca-shared` improving support for extension routes with the following features:
* Parameter `disabled` can be used to disable extension routes.
* Besides `component`, parameters `loadChildren` and `loadComponent` can also be used to define an extension route; the corresponding resolver must be defined using method `setLoadChildren` or `setLoadComponent` respectively; this resolver must implement the same interface as the corresponding property of `@angular/router/Route`.
* Besides `auth`, parameters `canActivate` and `canActivateChild` can also be used to apply guards to an extension route; the corresponding resolver must be defined using method `setAuthGuards` from `@alfresco/adf-extensions/ExtensionService`.
