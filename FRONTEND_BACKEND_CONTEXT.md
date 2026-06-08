# SportKalender Backend Context For Frontend

Use this document as the handoff/context file for creating the frontend in `sportKalender-frontend`.

The backend is a Spring Boot REST API for managing sport calendar events and tasks. The frontend should call this backend through HTTP and should not duplicate backend logic.

## Backend Project

Backend folder:

```txt
SportKalender-main/
```

Main backend entry point:

```txt
src/main/java/com/modul/sportkalender/SportkalenderApplication.java
```

Important backend packages:

```txt
src/main/java/com/modul/sportkalender/
  auth/
    AuthController.java
  config/
    WebMvcConfig.java
  event/
    Event.java
    EventController.java
    EventRepository.java
    EventService.java
  security/
    AuthenticationRoleConverter.java
    Roles.java
    SecurityConfig.java
  swagger/
    OpenApi30Config.java
  task/
    Task.java
    TaskController.java
    TaskRepository.java
    TaskService.java
  user/
    UserController.java
```

## Backend Runtime

The backend runs on this port:

```txt
http://localhost:9090
```

Configuration source:

```txt
src/main/resources/application.yml
```

Swagger UI is configured at:

```txt
http://localhost:9090/
```

OpenAPI JSON is available at:

```txt
http://localhost:9090/v3/api-docs
```

Use the OpenAPI endpoint as the source of truth when generating frontend clients or checking endpoint details.

## Frontend Runtime Recommendation

The backend CORS configuration currently allows this frontend origin:

```txt
http://localhost:4200
```

This fits Angular's default dev server.

If the frontend uses Vite, React, Vue, or another dev server, the backend CORS origin must be updated in `SecurityConfig.java`, for example:

```java
.allowedOrigins("http://localhost:5173")
```

or multiple origins can be allowed if needed.

## Authentication

Most backend routes require authentication.

The backend is configured as an OAuth2 resource server using JWT tokens.

JWT issuer:

```txt
http://localhost:8080/realms/Sportkalender
```

This usually means Keycloak is expected to run locally on port `8080` with a realm named `Sportkalender`.

Frontend requests to protected endpoints should include:

```http
Authorization: Bearer <access_token>
```

The backend exposes a claims endpoint for checking the authenticated user:

```http
GET /api/auth/claims
```

During early frontend development, there are two possible approaches:

1. Implement Keycloak login in the frontend and send the JWT token with API requests.
2. Temporarily relax backend security for local development only.

The production-style approach is option 1.

## API Base URL

Use one central frontend config value:

```ts
export const environment = {
  apiUrl: 'http://localhost:9090'
};
```

All frontend services should build URLs from this base value.

Example:

```ts
`${environment.apiUrl}/api/event`
```

## Event API

Controller:

```txt
src/main/java/com/modul/sportkalender/event/EventController.java
```

Base path:

```txt
/api/event
```

Endpoints:

```http
GET    /api/event
GET    /api/event/{id}
POST   /api/event
PUT    /api/event/{id}
DELETE /api/event/{id}
```

### Event Model

Backend entity:

```java
public class Event {
    private Long id;
    private String title;
    private String location;
    private String description;
    private LocalDateTime dateTime;
}
```

Frontend TypeScript interface:

```ts
export interface Event {
  id?: number;
  title: string;
  location: string;
  description: string;
  dateTime: string;
}
```

`dateTime` is a Java `LocalDateTime`. Send and receive it as an ISO-like string, for example:

```txt
2026-06-08T18:30:00
```

### Event Request Examples

Create event:

```http
POST /api/event
Content-Type: application/json
Authorization: Bearer <access_token>
```

```json
{
  "title": "Football Training",
  "location": "Sports Hall",
  "description": "Weekly team practice",
  "dateTime": "2026-06-08T18:30:00"
}
```

Update event:

```http
PUT /api/event/1
Content-Type: application/json
Authorization: Bearer <access_token>
```

```json
{
  "title": "Football Training",
  "location": "Main Stadium",
  "description": "Updated training location",
  "dateTime": "2026-06-08T19:00:00"
}
```

## Task API

Controller:

```txt
src/main/java/com/modul/sportkalender/task/TaskController.java
```

Base path:

```txt
/api/task
```

Endpoints:

```http
GET    /api/task
GET    /api/task/{id}
POST   /api/task
PUT    /api/task/{id}
DELETE /api/task/{id}
```

### Task Model

Backend entity:

```java
public class Task {
    private Long id;
    private String title;
    private String description;
    private boolean completed;

    @ManyToOne
    private Event event;
}
```

Frontend TypeScript interface:

```ts
import { Event } from './event';

export interface Task {
  id?: number;
  title: string;
  description: string;
  completed: boolean;
  event?: Event;
}
```

### Task Request Examples

Create task without event:

```http
POST /api/task
Content-Type: application/json
Authorization: Bearer <access_token>
```

```json
{
  "title": "Prepare equipment",
  "description": "Bring balls, cones, and bibs",
  "completed": false
}
```

Create task connected to an event:

```http
POST /api/task
Content-Type: application/json
Authorization: Bearer <access_token>
```

```json
{
  "title": "Prepare equipment",
  "description": "Bring balls, cones, and bibs",
  "completed": false,
  "event": {
    "id": 1
  }
}
```

Update task:

```http
PUT /api/task/1
Content-Type: application/json
Authorization: Bearer <access_token>
```

```json
{
  "title": "Prepare equipment",
  "description": "Equipment is ready",
  "completed": true,
  "event": {
    "id": 1
  }
}
```

## Auth API

Controller:

```txt
src/main/java/com/modul/sportkalender/auth/AuthController.java
```

Base path:

```txt
/api/auth
```

Endpoints:

```http
GET /api/auth/claims
```

Returns the JWT claims of the authenticated user.

Example frontend use:

```ts
getClaims() {
  return this.http.get<Record<string, unknown>>(`${environment.apiUrl}/api/auth/claims`);
}
```

## Suggested Frontend Structure

Recommended structure for `sportKalender-frontend`:

```txt
sportKalender-frontend/
  src/
    app/
      core/
        api/
          event.service.ts
          task.service.ts
          auth.service.ts
        auth/
          auth.interceptor.ts
          keycloak.service.ts
        models/
          event.ts
          task.ts
      features/
        events/
          event-list/
          event-form/
          event-detail/
        tasks/
          task-list/
          task-form/
      shared/
        components/
      app.config.ts
      app.routes.ts
  README.md
```

For Angular, the services would typically live in `src/app/core/api`.

For React or Vue, keep the same idea but adapt folder names:

```txt
src/
  api/
  auth/
  models/
  features/
  components/
```

## Suggested Frontend Features

Build the actual application UI, not a landing page.

The first useful screen should show the calendar/events and task workflow.

Expected features:

```txt
Events:
- List events
- Create event
- Edit event
- Delete event
- View event details
- Show date, time, location, title, and description

Tasks:
- List tasks
- Create task
- Edit task
- Delete task
- Toggle completed state
- Optionally assign a task to an event

Auth:
- Login with Keycloak if authentication is enabled
- Attach Bearer token to backend requests
- Show basic authenticated user info from /api/auth/claims
```

## Angular Service Examples

### Event Service

```ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Event } from '../models/event';

@Injectable({ providedIn: 'root' })
export class EventService {
  private readonly baseUrl = `${environment.apiUrl}/api/event`;

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<Event[]> {
    return this.http.get<Event[]>(this.baseUrl);
  }

  getById(id: number): Observable<Event> {
    return this.http.get<Event>(`${this.baseUrl}/${id}`);
  }

  create(event: Event): Observable<Event> {
    return this.http.post<Event>(this.baseUrl, event);
  }

  update(id: number, event: Event): Observable<Event> {
    return this.http.put<Event>(`${this.baseUrl}/${id}`, event);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
```

### Task Service

```ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Task } from '../models/task';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly baseUrl = `${environment.apiUrl}/api/task`;

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<Task[]> {
    return this.http.get<Task[]>(this.baseUrl);
  }

  getById(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.baseUrl}/${id}`);
  }

  create(task: Task): Observable<Task> {
    return this.http.post<Task>(this.baseUrl, task);
  }

  update(id: number, task: Task): Observable<Task> {
    return this.http.put<Task>(`${this.baseUrl}/${id}`, task);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
```

### Auth Interceptor Idea

The frontend should add the token to protected API requests.

Pseudo-code:

```ts
Authorization: Bearer <access_token>
```

Angular interceptor idea:

```ts
const token = authService.getToken();

if (token) {
  request = request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
}
```

## Important Backend Notes For Frontend Development

1. The backend currently uses PostgreSQL:

```txt
jdbc:postgresql://localhost:5432/m-295-app
```

2. The configured database username is:

```txt
postgres
```

3. The backend security expects Keycloak on:

```txt
http://localhost:8080/realms/Sportkalender
```

4. Swagger UI is at the backend root:

```txt
http://localhost:9090/
```

5. Most application endpoints are protected by JWT authentication.

6. CORS currently allows only:

```txt
http://localhost:4200
```

7. API paths are case-insensitive because `WebMvcConfig` configures Spring path matching as case-insensitive.

## Prompt To Create The Frontend

Paste this prompt into an AI assistant inside the `sportKalender-frontend` project:

```txt
Create the frontend for a SportKalender application using the backend contract below.

Build the actual usable app as the first screen, not a marketing landing page.

Backend:
- Base URL: http://localhost:9090
- Swagger UI: http://localhost:9090/
- OpenAPI JSON: http://localhost:9090/v3/api-docs
- Most endpoints require Authorization: Bearer <access_token>
- Keycloak issuer: http://localhost:8080/realms/Sportkalender
- CORS currently allows http://localhost:4200

Data models:

Event:
- id?: number
- title: string
- location: string
- description: string
- dateTime: string, for example 2026-06-08T18:30:00

Task:
- id?: number
- title: string
- description: string
- completed: boolean
- event?: Event

Endpoints:

Events:
GET    /api/event
GET    /api/event/{id}
POST   /api/event
PUT    /api/event/{id}
DELETE /api/event/{id}

Tasks:
GET    /api/task
GET    /api/task/{id}
POST   /api/task
PUT    /api/task/{id}
DELETE /api/task/{id}

Auth:
GET /api/auth/claims

Expected UI:
- Event list
- Event create/edit form
- Event detail view
- Task list
- Task create/edit form
- Completed toggle for tasks
- Optional event assignment for tasks
- Auth/token handling if implementing Keycloak

Keep the API base URL in one environment/config file.
Create typed frontend models and API services.
Use a clean operational dashboard/app layout suitable for managing a sport calendar.
```

## Quick Development Checklist

Before frontend API calls will work, make sure:

```txt
[ ] Backend is running on http://localhost:9090
[ ] PostgreSQL database is running
[ ] Keycloak is running if protected endpoints are used
[ ] Frontend runs on an origin allowed by CORS
[ ] API requests include JWT Bearer token when required
[ ] Swagger/OpenAPI can be opened at http://localhost:9090/
```
