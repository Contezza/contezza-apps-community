# Contezza Thumbnail Column

`ThumbnailColumnComponent` is a thumbnail component which allows to customise:
* icon
* badge
* tooltip
* style

Importing `ContentServicesExtensionModule` registers `ThumbnailColumnComponent` with id `columns.thumbnail` in `DynamicComponentService` so that it can be used via extensions, e.g.:
```json
{
    "id": "my-module.columns.custom-thumbnail",
    "template": "columns.thumbnail"
}
```
The extension definition also supports the following (optional) settings:

* `withSelection` - If `true` then the thumbnail is replaced by a selection icon when the corresponding item is selected.

These can be defined via extensions as follows:

```json
{
    "id": "my-module.columns.custom-thumbnail",
    "template": "columns.thumbnail",
    "data": {
        "withSelection": true
    }
}
```

Service `ThumbnailColumnService` defines methods `setThumbnailIconResolvers` and `setThumbnailBadgeResolvers` which allow to customise the logic used to build data for `ThumbnailColumnComponent`.

Methods `setThumbnailIconResolvers` and `setThumbnailBadgeResolvers` accept `ThumbnailResolver`'s as parameters and add them to the respective intern registry. A `ThumbnailResolver` consists of:
* `order` - Defines the priority order. The lower the value, the higher is the priority. If not defined then the resolver is applied with the lowest possible priority.
* `apply` - Evaluates whether the resolver is applicable to the given `item` and returns the corresponding icon or badge (and possibly other thumbnail data, such as tooltip and style) if this is the case. It returns `null` otherwise. Custom column configuration and rule context are also supported as (optional) evaluation parameters.

The logic used to build data for `ThumbnailColumnComponent` for a given `item` in a given `context` is as follows:
1. Search an applicable icon resolver in the intern registry, based on a matching function applied to the given `item` and optional parameters;
2. Apply the resolver to retrieve icon data;
3. Search an applicable badge resolver in the intern registry, based on a matching function applied to the given `item` and optional parameters;
4. Apply the resolver to retrieve badge data;
5. Merge icon and badge data.

N.B.:

* Custom column configuration can be provided via extensions, for instance:
    ```json
    {
        "id": "my-module.columns.custom-thumbnail",
        "template": "columns.thumbnail",
        "data": {
            "badge": "my-custom-badge"
        }
    }
    ```  
    In this case `apply` can use this parameter as follows:
    ```ts
    {
        apply: (item, config) =>
            config?.badge === 'my-custom-badge'
                ? '⚠️'
                : null
    }
    ```
* Here `context` means ADF `RuleContext` and consists of information about the navigation state, such as the current url, the current folder and the parent table component.
* If the above logic cannot retrieve a suitable icon then the procedure stops and returns `null`. There cannot be badges without icons.
