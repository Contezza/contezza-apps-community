# Contezza Core Theme

Include `provideTheme()` in the app providers.
This provides and initialises [ThemeService](shared/src/lib/services/theme.service.ts).

This services manages the app theme:
- Retrieves the list of available themes from app extensions. This is defined using feature key `themes`.
- Manages the selection of the current theme, persisting it in local storage and reading it by app initialisation.
- Listens to changes in the current theme and places the corresponding CSS class into the root HTML element of the page.
