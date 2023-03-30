# @contezza/core/extensions

Secondary entry point of `@contezza/core`. It can be used by importing from `@contezza/core/extensions`.

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

### Replacers

Each import can also define a list of replacers. In this case the import implements the interface
```
interface Import {
   id: string;
   replace?: { replaced: string; replacer: any }[]
}
```
An object can have imports with and without replacers at the same time, therefore the complete typing of the property `imports` is
```
string | Import | (string | Import)[]
```
If an object is imported and replacers are defined, then a replace operation is performed (replace `replaced` with `replacer`) on each object property of type `string`.

N.B.:
* The same replacer can be applied multiple times in multiple proeprties of the imported object.
* The same object can be imported multiple times with different replacers.
