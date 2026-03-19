# Contezza Layout Navbar

Ui navbar component.

Import:
```ts
import { NavbarComponent } from '@contezza/layout/component/navbar';
```
Usage:
```angular2html
<contezza-navbar [mode]="mode" [groups]="groups"></contezza-navbar>
```
Parameters:
* `mode` is either `expanded` or `collapsed`.
* `groups` is an array of items of type `NavbarGroup`. This type extends `NavBarGroupRef` from `@alfresco/adf-extensions` by allowing `items` of type `NavbarItem`, which in turn extends `NavBarLinkRef` from `@alfresco/adf-extensions` by supporting the following (optional) parameters:
  * `urlMatcher: string`: Allows to define whether the item is active based on a regular expression;
  * `favourite: boolean`: If set `true` in a navbar-item child, navigating to the parent redirects to this child.
  * `openInCollapsed: boolean`: If set `true` in a navbar item with children, in collapsed mode this item does not appear and its children appear as independent items.
