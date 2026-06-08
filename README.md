# SportKalender Frontend

Angular frontend for the Modul 294 SportKalender project. The app uses the Spring Boot backend contract documented in [FRONTEND_BACKEND_CONTEXT.md](FRONTEND_BACKEND_CONTEXT.md).

## Implemented Scope

- Angular standalone application with routing and SCSS.
- Dashboard, event list, event detail, event form, task list, task form, auth status, role badge, shell, and forbidden page components.
- CRUD services for `/api/event` and `/api/task`.
- Auth claims service for `/api/auth/claims`.
- OAuth2/Keycloak integration with automatic bearer-token HTTP interceptor.
- `READ` and `UPDATE` role support with guarded routes and hidden update controls.
- Vitest unit tests for API services and shared UI.

## Backend Setup

Expected backend services:

```txt
Spring Boot API: http://localhost:9090
Swagger UI:      http://localhost:9090/
OpenAPI JSON:    http://localhost:9090/v3/api-docs
Keycloak issuer: http://localhost:8080/realms/Sportkalender
```

The frontend runs on `http://localhost:4200`, which matches the current backend CORS configuration.

## Keycloak Client

Create a public client in the `Sportkalender` realm:

```txt
Client ID: sportkalender-frontend
Valid redirect URIs: http://localhost:4200/*
Web origins: http://localhost:4200
Roles: READ, UPDATE
```

Users with `READ` can view dashboard, events, and tasks. Users with `UPDATE` can create, edit, delete, and toggle records.

## Development

```bash
npm install
npm start
```

Open `http://localhost:4200`.

## Verification

```bash
npm test
npm run build
```

## Project Structure

```txt
src/app/
	core/
		api/        REST services for backend controllers
		auth/       Keycloak service, interceptor, route guard
		models/     Event, Task, and auth claim types
	features/
		auth/       Forbidden page
		dashboard/  Overview page
		events/     Event CRUD screens
		tasks/      Task CRUD screens
	shared/
		components/ Shell, auth status, role badge
```

Suggested commit slices are listed in [COMMIT_BREAKS.md](COMMIT_BREAKS.md).
