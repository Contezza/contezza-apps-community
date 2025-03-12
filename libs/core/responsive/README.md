# Contezza Core Responsive

Library with tools to help making applications responsive.

Service `ResponsiveService` exposes observables which monitor changes in the viewport size.
Moreover it can be instructed to add a css class to the document root based on the current viewport size.

Module `ResponsiveModule` initialises the above behaviour of `ResponsiveService`.

In order to use this library:
* `ResponsiveModule`  must be imported in the root of the application.
* the stylesheet `responsive.theme.scss` must be included, for instance by adding it to the `project.json`.
* `ResponsiveService` can be injected into any component and responsive behaviour can be implemented based on the exposed observables.
