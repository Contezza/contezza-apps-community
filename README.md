# Contezza Community Libraries

## Release notes

Release notes are written in dutch in [asciidoc](docs/src/docs/asciidoc/contezza-apps-community.adoc).

## Libraries

Contezza has made different libraries for personal purposes and also for the community, these can be found in the libs folder.

## APP

There is 1 [demo-app](apps/demo-app) (shell) available and this project.

Connection with Alfresco is set via [proxy.conf.js](apps/demo-app/proxy.conf.js) and [proxy-helpers.js](proxy-helpers.js). To connect with a specific Alfresco environment, set its url as value of
```js
const ALFRESCO_URL = 'https://...';
```
in [proxy-helpers.js](proxy-helpers.js).

This project can be build with the following commands

`npm install`
`npm run start:demo-app`

Or if you use VSCODE
- Terminal
- Run Task
- npm: start:demo-app

This will run a Default Alfresco-Content-App (ACA) with some libraries.
One of the most important Contezza libraries are the Javascript-Console & Node-browser in ADF
`libs/mgmt/js-console`
`libs/mgmt/node-browser`

## Custom Menu
In the default ACA you'll see an extra menu-item with name Admin console
![Menu Item](docs/src/docs/asciidoc/images/Personal%20Files%20-%20Demo%20App-%20extra%20Menu%20Item.png "Menu Item")

## Javascript Console
[Code](libs/mgmt/js-console)
![Javascript Console](docs/src/docs/asciidoc/images/Personal%20Files%20-%20Demo%20App-%20Javascript%20console.png "Javascript Console")

### Features
Similar to the share Javascript Console, but with extra:
- Dark theme
- Document browse mechanism
- Monaco editor
- Easy Save features

## Nodebrowser
[Code](libs/mgmt/node-browser)
![Nodebrowser](docs/src/docs/asciidoc/images/Personal%20Files%20-%20Demo%20App-%20Nodebrowser.png "Nodebrowser")

### Features
Similar to the share/repo nodebrowser, but with extra:
- Remembers last search
- If only a uuid has been pasted, the library will include the workspace spacestore before it
