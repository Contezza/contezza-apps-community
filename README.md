# Contezza Community Libraries

## Release notes

Release notes are written in Dutch in [asciidoc](docs/src/docs/asciidoc/contezza-apps-community.adoc).

## Libraries

Contezza has made different libraries for personal purposes and also for the community, these can be found in the libs folder.

## APP

There is 1 [demo-app](apps/demo-app) (shell) available in this project.

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

## Ontwikkeling

### Nexus Configuratie

De libraries kunnen worden geïmporteerd vanuit contezza-apps-community repository. Deze repository zit in [Nexus](https://nexus.contezza.nl) en om toegang tot Nexus te hebben moet de bestand `.npmrc` in de gebruikersmap zo eruit zien:

```
registry=https://registry.npmjs.org/
@contezza:registry=https://nexus.contezza.nl/repository/npm-releases/
//nexus.contezza.nl/repository/npm-releases/:username=email@contezza.nl
//nexus.contezza.nl/repository/npm-releases/:_password=encoded_password
email=email@contezza.nl
always-auth=true
legacy-peer-deps=true
```

Waar:
* `email@contezza.nl` is de email van de gebruiker
* `encoded_password` is het wachtwoord van de gebruiker encoded via de commando `echo -n "password" | base64`

### Importeren zonder releasen

De handigste manier om wijzigingen in deze repository te kunnen testen binnen de contezza-apps repository, bijvoorbeeld ter voorbereiding voor een release, is om alle libraries van deze repository te exporteren als `.tgz` bestanden. Hieronder wordt er beschreven hoe dit gedaan wordt.

In deze repository:
* eventuele vorige geëxporteerde `.tgz` bestanden verwijderen
* alle temporary mappen verwijderen: `.angular`, `dist`, `nxcache`
* run script `build-libs` en vervolgens `pack-libs`
* hiermee worden een aantal `.tgz` bestanden aangemaakt in de root van deze repository,

In contezza-apps repository:
* eventuele vorige geïmporteerde `.tgz` bestanden verwijderen
* `nxcache` verwijderen
* `node_modules/@contezza` en `package-lock.json` verwijderen om zeker te weten dat de meeste recente versie wordt geïmporteerd
* alle boven aangemaakte `.tgz` bestanden kopiëren in de root van de repository
* in `package.json`, bij alle `@contezza/*` dependencies de npm versie vervangen met `file:<volle naam van het bijbehorende .tgz bestand>`, bijvoorbeeld:
```
"@contezza/core": "file:contezza-core-2.3.0.tgz"
```
* run `npm i`

### Community branch

The `community` branch is meant to be shared in [Github](https://github.com/Contezza/contezza-apps-community). After any release, the `main` branch is merged into the `community` branch and this is pushed into Github. To push `community` into Github:
* open this project with VS code
* from Source Control, select More Actions -> Remote -> Add remote, then copy `https://github.com/Contezza/contezza-apps-community` in the popup, press Enter and choose a name (e.g. `github`); this needs to be done only once
* from Source Control, select More Actions -> Pull, Push -> Push to... and select the name previously chosen from the popup.

Ideally, this will be included in a pipeline in the future. 

