import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { EventService } from '../../core/api/event.service';
import { TaskService } from '../../core/api/task.service';
import { KeycloakAuthService } from '../../core/auth/keycloak.service';
import { Event } from '../../core/models/event';
import { Task } from '../../core/models/task';

interface CalendarDay {
  date: Date;
  isoDate: string;
  dayNumber: number;
  inCurrentMonth: boolean;
  isToday: boolean;
  events: Event[];
}

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="page">
      <header class="page-header">
        <div>
          <h1 class="page-title">SportKalender</h1>
          <p class="page-subtitle">Trainings, Spiele, Wettkämpfe und Aufgaben im Monatsüberblick.</p>
        </div>
        @if (auth.hasRole('UPDATE')) {
          <a class="button" routerLink="/events/new">Termin erfassen</a>
        }
      </header>

      @if (apiWarning()) {
        <section class="panel warning-panel">
          <strong>API-Hinweis</strong>
          <span>{{ apiWarning() }}</span>
          @if (!auth.authenticated() && auth.available()) {
            <button class="secondary" type="button" [disabled]="auth.loginPending()" (click)="auth.login()">
              {{ auth.loginPending() ? 'Login wird gestartet' : 'Anmelden' }}
            </button>
          } @else if (!auth.authenticated()) {
            <button class="secondary" type="button" (click)="auth.refreshAvailability()">Keycloak prüfen</button>
          }
          @if (auth.authMessage()) {
            <small>{{ auth.authMessage() }}</small>
          }
        </section>
      }

      <section class="calendar-shell panel">
        <div class="calendar-toolbar">
          <div class="calendar-actions">
            <button class="secondary" type="button" (click)="previousMonth()">‹ Zurück</button>
            <button class="secondary" type="button" (click)="goToday()">Heute</button>
            <button class="secondary" type="button" (click)="nextMonth()">Weiter ›</button>
          </div>
          <div class="calendar-title">
            <strong>{{ monthLabel() }}</strong>
            <span>{{ apiWarning() ? 'Demoansicht' : 'Monatsansicht' }}</span>
          </div>
          <a class="button secondary" routerLink="/events">Terminliste</a>
        </div>

        <div class="calendar-grid weekday-row" aria-hidden="true">
          @for (weekday of weekdays; track weekday) {
            <div>{{ weekday }}</div>
          }
        </div>

        <div class="calendar-grid month-grid">
          @for (day of calendarDays(); track day.isoDate) {
            <article class="calendar-day" [class.muted-day]="!day.inCurrentMonth" [class.today]="day.isToday">
              <div class="day-head">
                <span>{{ day.dayNumber }}</span>
                @if (day.isToday) {
                  <small>Heute</small>
                }
              </div>

              <div class="day-events">
                @for (event of day.events; track event.id ?? event.title) {
                  @if (isDemoMode()) {
                    <div class="calendar-event demo-event" [title]="event.description">
                      <strong>{{ eventTime(event) }} {{ event.title }}</strong>
                      <span>{{ event.location }}</span>
                    </div>
                  } @else {
                    <a class="calendar-event" [routerLink]="['/events', event.id]" [title]="event.description">
                      <strong>{{ eventTime(event) }} {{ event.title }}</strong>
                      <span>{{ event.location }}</span>
                    </a>
                  }
                }
              </div>
            </article>
          }
        </div>
      </section>

      <div class="grid three">
        <article class="panel metric">
          <span>Termine im Monat</span>
          <strong>{{ eventsInSelectedMonth().length }}</strong>
        </article>
        <article class="panel metric">
          <span>Offene Aufgaben</span>
          <strong>{{ openTasks().length }}</strong>
        </article>
        <article class="panel metric">
          <span>Zugriff</span>
          <strong>{{ auth.hasRole('UPDATE') ? 'UPDATE' : 'READ' }}</strong>
        </article>
      </div>

      <div class="grid two">
        <section class="panel stack">
          <div class="toolbar">
            <h2>Nächste Sporttermine</h2>
            <a routerLink="/events">Alle Termine</a>
          </div>
          @for (event of upcomingEvents(); track event.id ?? event.title) {
            @if (isDemoMode()) {
              <div class="summary-row">
                <span>{{ event.title }}</span>
                <small>{{ eventDateTime(event) }} · {{ event.location }}</small>
                <small>{{ event.description }}</small>
                @if (tasksForEvent(event).length) {
                  <small>{{ tasksForEvent(event).length }} Aufgabe(n) zugeordnet</small>
                }
              </div>
            } @else {
              <a class="summary-row" [routerLink]="['/events', event.id]">
                <span>{{ event.title }}</span>
                <small>{{ eventDateTime(event) }} · {{ event.location }}</small>
                @if (tasksForEvent(event).length) {
                  <small>{{ tasksForEvent(event).length }} Aufgabe(n) zugeordnet</small>
                }
              </a>
            }
          } @empty {
            <p class="muted">Noch keine Termine vorhanden.</p>
          }
        </section>

        <section class="panel stack">
          <div class="toolbar">
            <h2>Offene Aufgaben</h2>
            <a routerLink="/tasks">Alle Aufgaben</a>
          </div>
          @for (task of openTasks(); track task.id ?? task.title) {
            <div class="summary-row">
              <span>{{ task.title }}</span>
              <small>{{ task.description }}</small>
              @if (task.event?.id) {
                <small>Termin-ID: {{ task.event?.id }}</small>
              }
            </div>
          } @empty {
            <p class="muted">Keine offenen Aufgaben.</p>
          }
        </section>
      </div>
    </section>
  `,
  styles: `
    h2 {
      font-size: 1.05rem;
      margin: 0;
    }

    .warning-panel {
      align-items: center;
      background: #fff7ed;
      border-color: #fed7aa;
      color: #9a3412;
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .calendar-shell {
      display: grid;
      gap: 0.75rem;
      padding: 1rem;
    }

    .calendar-toolbar {
      align-items: center;
      display: grid;
      gap: 0.75rem;
      grid-template-columns: 1fr auto 1fr;
    }

    .calendar-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.45rem;
    }

    .calendar-title {
      display: grid;
      justify-items: center;
      text-align: center;
    }

    .calendar-title strong {
      font-size: 1.15rem;
      text-transform: capitalize;
    }

    .calendar-title span {
      color: var(--muted);
      font-size: 0.82rem;
      font-weight: 800;
      text-transform: uppercase;
    }

    .calendar-grid {
      display: grid;
      grid-template-columns: repeat(7, minmax(0, 1fr));
    }

    .weekday-row {
      background: var(--surface-muted);
      border: 1px solid var(--border);
      border-bottom: 0;
      border-radius: 8px 8px 0 0;
      color: var(--muted);
      font-size: 0.82rem;
      font-weight: 900;
      text-align: center;
      text-transform: uppercase;
    }

    .weekday-row div {
      padding: 0.55rem;
    }

    .month-grid {
      border-left: 1px solid var(--border);
      border-top: 1px solid var(--border);
    }

    .calendar-day {
      background: #fff;
      border-bottom: 1px solid var(--border);
      border-right: 1px solid var(--border);
      min-height: 7.6rem;
      padding: 0.45rem;
    }

    .calendar-day.today {
      background: #fef9c3;
    }

    .calendar-day.muted-day {
      background: #f8fafc;
      color: #a7b1bd;
    }

    .day-head {
      align-items: center;
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.35rem;
    }

    .day-head span {
      font-weight: 900;
    }

    .day-head small {
      color: var(--primary-strong);
      font-size: 0.72rem;
      font-weight: 900;
    }

    .day-events {
      display: grid;
      gap: 0.25rem;
    }

    .calendar-event {
      background: var(--primary);
      border-radius: 4px;
      color: #fff;
      display: grid;
      gap: 0.05rem;
      overflow: hidden;
      padding: 0.25rem 0.35rem;
      text-decoration: none;
    }

    .calendar-event:nth-child(2n) {
      background: var(--accent);
    }

    .calendar-event:nth-child(3n) {
      background: #6d5bd0;
    }

    .demo-event {
      cursor: default;
    }

    .calendar-event strong,
    .calendar-event span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .calendar-event strong {
      font-size: 0.76rem;
    }

    .calendar-event span {
      font-size: 0.72rem;
      opacity: 0.88;
    }

    .metric span {
      color: var(--muted);
      display: block;
      font-weight: 800;
    }

    .metric strong {
      display: block;
      font-size: 2rem;
      margin-top: 0.25rem;
    }

    .summary-row {
      border: 1px solid var(--border);
      border-radius: 6px;
      color: inherit;
      display: grid;
      gap: 0.2rem;
      padding: 0.75rem;
      text-decoration: none;
    }

    .summary-row small {
      color: var(--muted);
    }

    @media (max-width: 900px) {
      .calendar-toolbar {
        grid-template-columns: 1fr;
      }

      .calendar-title {
        justify-items: start;
        text-align: left;
      }

      .calendar-grid {
        min-width: 760px;
      }

      .calendar-shell {
        overflow-x: auto;
      }
    }
  `,
})
export class DashboardPage implements OnInit {
  readonly weekdays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  private readonly eventService = inject(EventService);
  private readonly taskService = inject(TaskService);
  readonly auth = inject(KeycloakAuthService);
  readonly events = signal<Event[]>([]);
  readonly tasks = signal<Task[]>([]);
  readonly selectedMonth = signal(new Date());
  readonly apiWarning = signal('');
  readonly isDemoMode = computed(() => Boolean(this.apiWarning()));
  readonly openTasks = computed(() => this.tasks().filter((task) => !task.completed));
  readonly monthLabel = computed(() => new Intl.DateTimeFormat('de-CH', { month: 'long', year: 'numeric' }).format(this.selectedMonth()));
  readonly eventsInSelectedMonth = computed(() => this.events().filter((event) => this.isSameMonth(this.eventDate(event), this.selectedMonth())));
  readonly upcomingEvents = computed(() => [...this.events()].sort((a, b) => a.dateTime.localeCompare(b.dateTime)).slice(0, 5));
  readonly calendarDays = computed<CalendarDay[]>(() => {
    const selected = this.selectedMonth();
    const firstOfMonth = new Date(selected.getFullYear(), selected.getMonth(), 1);
    const mondayOffset = (firstOfMonth.getDay() + 6) % 7;
    const start = new Date(firstOfMonth);
    start.setDate(firstOfMonth.getDate() - mondayOffset);

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      const isoDate = this.toIsoDate(date);

      return {
        date,
        isoDate,
        dayNumber: date.getDate(),
        inCurrentMonth: date.getMonth() === selected.getMonth(),
        isToday: isoDate === this.toIsoDate(new Date()),
        events: this.events().filter((event) => this.toIsoDate(this.eventDate(event)) === isoDate),
      };
    });
  });

  ngOnInit(): void {
    forkJoin({
      events: this.eventService.getAll().pipe(
        catchError((error: unknown) => {
          this.apiWarning.set(this.apiWarningFor(error));
          return of(this.demoEvents());
        }),
      ),
      tasks: this.taskService.getAll().pipe(
        catchError((error: unknown) => {
          this.apiWarning.set(this.apiWarningFor(error));
          return of(this.demoTasks());
        }),
      ),
    }).subscribe({
      next: ({ events, tasks }) => {
        this.events.set(events);
        this.tasks.set(tasks);
      },
    });
  }

  previousMonth(): void {
    const current = this.selectedMonth();
    this.selectedMonth.set(new Date(current.getFullYear(), current.getMonth() - 1, 1));
  }

  nextMonth(): void {
    const current = this.selectedMonth();
    this.selectedMonth.set(new Date(current.getFullYear(), current.getMonth() + 1, 1));
  }

  goToday(): void {
    this.selectedMonth.set(new Date());
  }

  eventTime(event: Event): string {
    return new Intl.DateTimeFormat('de-CH', { hour: '2-digit', minute: '2-digit' }).format(this.eventDate(event));
  }

  eventDateTime(event: Event): string {
    return new Intl.DateTimeFormat('de-CH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(this.eventDate(event));
  }

  tasksForEvent(event: Event): Task[] {
    return this.tasks().filter((task) => task.event?.id === event.id);
  }

  private eventDate(event: Event): Date {
    return new Date(event.dateTime);
  }

  private toIsoDate(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  private isSameMonth(left: Date, right: Date): boolean {
    return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth();
  }

  private apiWarningFor(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 401) {
        if (!this.auth.available()) {
          return 'Das Backend läuft, aber Keycloak ist auf http://localhost:8080 nicht erreichbar. Der Kalender zeigt bis dahin eine lokale Demoansicht.';
        }

        return 'Das Backend läuft, verlangt für diese Daten aber eine Anmeldung. Der Kalender zeigt bis zum Login eine lokale Demoansicht.';
      }

      if (error.status === 403) {
        return 'Du bist angemeldet, hast für diese Daten aber nicht die nötige Rolle. Der Kalender zeigt eine lokale Demoansicht.';
      }

      if (error.status === 0) {
        return 'Die API ist vom Browser aus nicht erreichbar. Prüfe CORS, Backend-Port 9090 und die Frontend-Origin http://localhost:4200.';
      }
    }

    return 'Backenddaten konnten nicht geladen werden. Der Kalender zeigt eine lokale Demoansicht mit Sportterminen und Aufgaben.';
  }

  private demoEvents(): Event[] {
    const current = this.selectedMonth();
    const year = current.getFullYear();
    const month = current.getMonth();

    return [
      {
        id: 9001,
        title: 'Fussball Training',
        location: 'Sportplatz Nord',
        description: 'Technik, Passspiel und kurzes Abschlussspiel.',
        dateTime: this.toDateTime(new Date(year, month, 4), 18, 30),
      },
      {
        id: 9002,
        title: 'Basketball Match',
        location: 'Dreifachhalle',
        description: 'Meisterschaftsspiel gegen BC Winterthur.',
        dateTime: this.toDateTime(new Date(year, month, 9), 19, 0),
      },
      {
        id: 9003,
        title: 'Laufgruppe Intervall',
        location: 'Stadionbahn',
        description: '6 x 800 Meter mit gemeinsamer Auswertung.',
        dateTime: this.toDateTime(new Date(year, month, 14), 17, 45),
      },
      {
        id: 9004,
        title: 'Volleyball Turnier',
        location: 'Sporthalle Süd',
        description: 'Mixed-Turnier mit Gruppenphase und Finalrunde.',
        dateTime: this.toDateTime(new Date(year, month, 21), 10, 0),
      },
      {
        id: 9005,
        title: 'Regeneration',
        location: 'Vereinsraum',
        description: 'Mobility, Teamfeedback und Materialkontrolle.',
        dateTime: this.toDateTime(new Date(year, month, 27), 16, 30),
      },
    ];
  }

  private demoTasks(): Task[] {
    return [
      {
        id: 9101,
        title: 'Trikots vorbereiten',
        description: 'Trikotsatz kontrollieren und in der Halle deponieren.',
        completed: false,
        event: { id: 9002 },
      },
      {
        id: 9102,
        title: 'Teilnehmerliste prüfen',
        description: 'Anwesenheiten für das Fussballtraining aktualisieren.',
        completed: false,
        event: { id: 9001 },
      },
      {
        id: 9103,
        title: 'Bälle aufpumpen',
        description: 'Material vor dem Volleyballturnier bereitstellen.',
        completed: true,
        event: { id: 9004 },
      },
    ];
  }

  private toDateTime(date: Date, hour: number, minute: number): string {
    return `${this.toIsoDate(date)}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;
  }
}
