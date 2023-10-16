# Contezza Community Libraries

## Release notes

Release notes is gemaakt in [asciidoc](docs/src/docs/asciidoc/contezza-apps-community.adoc).

## Nexus Configuratie

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

## Ontwikkeling

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

