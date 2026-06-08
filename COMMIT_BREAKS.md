# Suggested Commit Breaks

Use these as realistic project commits for the assessment history.

1. `chore: scaffold angular frontend`
   - Angular workspace with routing, SCSS, Vitest, strict TypeScript, README, and npm setup.

2. `feat(auth): add keycloak login and role guards`
   - Keycloak adapter, bearer-token HTTP interceptor, READ/UPDATE role checks, protected routes.

3. `feat(api): add typed backend services`
   - Event, Task, and Auth models/services using the central `environment.apiUrl`.

4. `feat(events): implement event crud screens`
   - Event list, detail, create/edit form, delete action, role-gated write controls.

5. `feat(tasks): implement task workflow`
   - Task list, create/edit form, completion toggle, delete action, optional event assignment.

6. `feat(ui): add dashboard and shared layout`
   - App shell, navigation, auth status, role badges, operational dashboard styling.

7. `test: add vitest coverage for component and api service`
   - Unit tests for a shared component and backend service integration.

8. `docs: document setup and assessment mapping`
   - README usage, backend assumptions, Keycloak setup notes, component overview.