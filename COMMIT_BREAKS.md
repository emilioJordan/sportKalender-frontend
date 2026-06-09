# Vorgeschlagene Commit-Pakete

Diese Aufteilung eignet sich für eine realistische Commit-Historie der ÜK-294-Projektarbeit.

1. `chore: scaffold angular frontend`
   - Angular-Projekt mit Routing, SCSS, Vitest, striktem TypeScript, README und npm-Setup.

2. `feat(auth): add keycloak login and role guards`
   - Keycloak-Adapter, Bearer-Token-HTTP-Interceptor, Rollenprüfung für READ/UPDATE und geschützte Routen.

3. `feat(api): add typed backend services`
   - Typisierte Modelle und Services für Termine, Aufgaben und Authentifizierung mit zentraler `environment.apiUrl`.

4. `feat(events): implement event crud screens`
   - Terminliste, Termindetails, Erstellen/Bearbeiten-Formular, Löschfunktion und rollenabhängige Schreibfunktionen.

5. `feat(tasks): implement task workflow`
   - Aufgabenliste, Erstellen/Bearbeiten-Formular, Statuswechsel, Löschfunktion und optionale Terminzuordnung.

6. `feat(ui): add dashboard and shared layout`
   - Layout, Navigation, Authentifizierungsstatus, Rollenanzeige und übersichtliches Dashboard-Styling.

7. `test: add vitest coverage for component and api service`
   - Unit Tests für eine wiederverwendbare Komponente und die Backend-Service-Anbindung.

8. `docs: document setup and assessment mapping`
   - README-Anleitung, Backend-Annahmen, Keycloak-Hinweise und Komponentenübersicht.