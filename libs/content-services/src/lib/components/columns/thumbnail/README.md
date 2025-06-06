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

* `badge` - If defined then the badge-resolution logic is triggered, based on a match between this value and the `id` of a `ThumbnailBadgeResolver` registered in `ThumbnailColumnService`.
* `withSelection` - If `true` then the thumbnail is replaced by a selection icon when the corresponding item is selected.

These can be defined via extensions as follows:

```json
{
    "id": "my-module.columns.custom-thumbnail",
    "template": "columns.thumbnail",
    "data": {
        "badge": "my-custom-badge",
        "withSelection": true
    }
}
```

Service `ThumbnailColumnService` defines methods `setThumbnailIconResolvers` and `setThumbnailBadgeResolvers` which allow to customise the logic used to build data for `ThumbnailColumnComponent`.

Method `setThumbnailIconResolvers` accepts `ThumbnailIconResolver`'s as parameters and adds them to an intern registry. A `ThumbnailIconResolver` consists of:
* `order` - Defines the priority order. The lower the value, the higher is the priority. If not defined then the resolver is applied with the lowest possible priority.
* `canApply` - Evaluates whether the resolver is applicable to the given `item`.
* `getIcon` - Returns the icon (and possibly other thumbnail data) associated to the given `item`.

Method `setThumbnailBadgeResolvers` accepts `ThumbnailBadgeResolver`'s as parameters and adds them to an intern registry. A `ThumbnailBadgeResolver` consists of:
* `id` - Unique identifier of the badge resolver. Differently from icon resolvers, badge resolvers are not applied based on a matching function applied to the given `item` but based on a match between this parameter and the `badge` parameter defined in the column settings.
* `getBadge` - Returns the badge (and possibly other thumbnail data) associated to the given `item`. Differently from the icon resolved by a `ThumbnailIconResolver`, the badge can be `undefined`.

The logic used to build data for `ThumbnailColumnComponent` for a given `item` is as follows:
1. Search an applicable `ThumbnailIconResolver` in the intern registry, based on a matching function applied to the given `item`;
2. Apply `ThumbnailIconResolver` to the given `item` if found to retrieve icon data;
3. Search a matching `ThumbnailBadgeResolver` in the intern registry based on a match between the `id` of the resolver and the `badge` parameter defined in the column settings;
4. Apply `ThumbnailBadgeResolver` to the given `item` if found to retrieve badge data;
5. Merge icon and badge data.
