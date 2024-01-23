# Contezza Property Titles

Pipe `translatePropertyTitle` transforms a key into an observable which retrieves an Alfresco property from the repository and returns its title. Moreover, this observable reacts to language changes in the app (based on `@ngx-translate`) and updates the title accordingly.

This is based on how the model is defined, therefore:
* it requires multiple-language models to fully work, 
* it does not always match what is desirable in the app.

Example:
```html
<ng-container *ngIf="title && (title | translatePropertyTitle) as title$; else translatedTitle">
    {{ title$ | async }}
</ng-container>
<ng-template #translatedTitle>
    {{ title | translate }}
</ng-template>
```

Notes:
* it returns `undefined` if no matching property is found, allowing the construction 'apply either `translatePropertyTitle` or `translate`' as in the example above;
* it returns an `Observable`, therefore it must always be followed by `async`.

The mapping between keys and properties is defined via injection token `KEY_PROPERTY_MAPPING` of type `(key: string) => string | undefined`. This function defines how to extract a property key from a generic key. The static method `PropertyTitleService.provideKeyPropertyMapping` facilitates this definition.

In the following example, all keys of the form `ALFRESCO.PROPERTIES.key` are mapped into `key`:
```ts
PropertyTitleService.provideKeyPropertyMapping((key) => {
    if (key.startsWith('ALFRESCO.PROPERTIES.')) {
        return key.slice('ALFRESCO.PROPERTIES.'.length);
    } else {
        return undefined;
    }
})
```

Multiple mappings are allowed.
