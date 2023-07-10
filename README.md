# Contezza Community Libraries

## Release notes

Release notes is gemaakt in [asciidoc](docs/src/docs/asciidoc/contezza-apps-community.adoc).

## Nexus Configuratie

De libraries kunnen worden geïmporteerd vanuit contezza-apps-community repository. Deze repository zit in [Nexus](https://nexus.contezza.nl) en om toegang tot Nexus te hebben moet de bestand `.npmrc` in de gebruikersmap zo eruit zien:

----
registry=https://registry.npmjs.org/
@contezza:registry=https://nexus.contezza.nl/repository/npm-releases/
//nexus.contezza.nl/repository/npm-releases/:username=email@contezza.nl
//nexus.contezza.nl/repository/npm-releases/:_password=encoded_password
email=email@contezza.nl
always-auth=true
legacy-peer-deps=true
----

Waar:
* `email@contezza.nl` is de email van de gebruiker
* `encoded_password` is het wachtwoord van de gebruiker encoded via de commando `echo -n "password" | base64`
