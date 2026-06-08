# SportKalender Frontend

Angular-Frontend für den ÜK 294 "Frontend für Applikationen realisieren". Die Applikation verwendet das Spring-Boot-Backend aus Modul 295 und orientiert sich am Backend-Vertrag in [FRONTEND_BACKEND_CONTEXT.md](FRONTEND_BACKEND_CONTEXT.md).

## Umgesetzter Umfang

- Angular-Standalone-Applikation mit Routing und SCSS.
- Komponenten für Übersicht, Terminliste, Termindetails, Terminformular, Aufgabenliste, Aufgabenformular, Authentifizierungsstatus, Rollenanzeige, Layout und Zugriffsschutz.
- CRUD-Services für `/api/event` und `/api/task`.
- Auth-Service für `/api/auth/claims`.
- OAuth2-/Keycloak-Anbindung mit automatischem Bearer-Token-Interceptor.
- Unterstützung der Rollen `READ` und `UPDATE` mit geschützten Routen und ausgeblendeten Bearbeitungsfunktionen.
- Unit Tests mit Vitest für API-Services und wiederverwendbare UI-Komponenten.

## Backend-Voraussetzungen

Erwartete Backend-Dienste:

```txt
Spring Boot API: http://localhost:9090
Swagger UI:      http://localhost:9090/
OpenAPI JSON:    http://localhost:9090/v3/api-docs
Keycloak Issuer: http://localhost:8080/realms/Sportkalender
```

Das Frontend läuft auf `http://localhost:4200`. Diese Origin ist im Backend aktuell für CORS freigegeben.

## Keycloak-Client

Im Realm `Sportkalender` wird ein öffentlicher Client benötigt:

```txt
Client ID: sportkalender-frontend
Valid redirect URIs: http://localhost:4200/*
Web origins: http://localhost:4200
Rollen: READ, UPDATE
```

Benutzer mit `READ` dürfen Übersicht, Termine und Aufgaben ansehen. Benutzer mit `UPDATE` dürfen Termine und Aufgaben erstellen, bearbeiten, löschen und den Aufgabenstatus ändern.

## Entwicklung

```bash
npm install
npm start
```

Danach `http://localhost:4200` im Browser öffnen.

## Prüfung

```bash
npm test
npm run build
```

## Projektstruktur

```txt
src/app/
	core/
		api/        REST-Services für die Backend-Controller
		auth/       Keycloak-Service, Interceptor und Route Guard
		models/     Typen für Termin, Aufgabe und Auth-Claims
	features/
		auth/       Seite für verweigerten Zugriff
		dashboard/  Übersichtsseite
		events/     Termin-CRUD-Seiten
		tasks/      Aufgaben-CRUD-Seiten
	shared/
		components/ Layout, Authentifizierungsstatus, Rollenanzeige
```

Vorgeschlagene Commit-Pakete stehen in [COMMIT_BREAKS.md](COMMIT_BREAKS.md).
