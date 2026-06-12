import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { EventService } from '../../../../core/api/event.service';
import { KeycloakAuthService } from '../../../../core/keycloak/keycloak.service';
import { Event } from '../../../../core/models/event';
import { CalendarComponent } from '../../components/calendar/calendar.component';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [RouterLink, CalendarComponent],
  template: `
    <section class="page">
      <header class="page-header">
        <div>
          <h1 class="page-title">SportKalender</h1>
          <p class="page-subtitle">Trainings, Spiele und Wettkämpfe im Monatsüberblick.</p>
        </div>
        @if (auth.hasRole('READ')) {
          <a class="button" routerLink="/events/new">Termin erfassen</a>
        }
      </header>

      <app-calendar
        [events]="events()"
        [selectedMonth]="selectedMonth()"
        [demoMode]="isDemoMode()"
        (selectedMonthChange)="selectedMonth.set($event)"
      />

      <div class="grid three">
        <article class="panel metric">
          <span>Termine im Monat</span>
          <strong>{{ eventsInSelectedMonth().length }}</strong>
        </article>
      </div>

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
              </div>
            } @else {
              <a class="summary-row" [routerLink]="['/events', event.id]">
                <span>{{ event.title }}</span>
                <small>{{ eventDateTime(event) }} · {{ event.location }}</small>
              </a>
            }
          } @empty {
            <p class="muted">Noch keine Termine vorhanden.</p>
          }
      </section>
    </section>
  `,
  styles: `
    h2 {
      font-size: 1.05rem;
      margin: 0;
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
  `,
})
export class DashboardPage implements OnInit {
  private readonly eventService = inject(EventService);
  readonly auth = inject(KeycloakAuthService);
  readonly events = signal<Event[]>([]);
  readonly selectedMonth = signal(new Date());
  readonly apiWarning = signal('');
  readonly isDemoMode = computed(() => Boolean(this.apiWarning()));
  readonly eventsInSelectedMonth = computed(() => this.events().filter((event) => this.isSameMonth(this.eventDate(event), this.selectedMonth())));
  readonly upcomingEvents = computed(() => [...this.events()].sort((a, b) => a.dateTime.localeCompare(b.dateTime)).slice(0, 5));

  ngOnInit(): void {
    this.eventService
      .getAll()
      .pipe(
        catchError((error: unknown) => {
          this.apiWarning.set(this.apiWarningFor(error));
          return of(this.demoEvents());
        }),
      )
      .subscribe((events) => this.events.set(events));
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

    return 'Backenddaten konnten nicht geladen werden.';
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

  private toDateTime(date: Date, hour: number, minute: number): string {
    return `${this.toIsoDate(date)}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;
  }
}
