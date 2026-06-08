import { SlicePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { EventService } from '../../core/api/event.service';
import { TaskService } from '../../core/api/task.service';
import { KeycloakAuthService } from '../../core/auth/keycloak.service';
import { Event } from '../../core/models/event';
import { Task } from '../../core/models/task';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [RouterLink, SlicePipe],
  template: `
    <section class="page">
      <header class="page-header">
        <div>
          <h1 class="page-title">Übersicht</h1>
          <p class="page-subtitle">Aktuelle Sporttermine, offene Aufgaben und Rollenstatus.</p>
        </div>
        @if (auth.hasRole('UPDATE')) {
          <a class="button" routerLink="/events/new">Termin erfassen</a>
        }
      </header>

      <div class="grid three">
        <article class="panel metric">
          <span>Termine</span>
          <strong>{{ events().length }}</strong>
        </article>
        <article class="panel metric">
          <span>Offene Aufgaben</span>
          <strong>{{ openTasks().length }}</strong>
        </article>
        <article class="panel metric">
          <span>Ihre Rolle</span>
          <strong>{{ auth.hasRole('UPDATE') ? 'UPDATE' : 'READ' }}</strong>
        </article>
      </div>

      <div class="grid two">
        <section class="panel stack">
          <div class="toolbar">
            <h2>Nächste Termine</h2>
            <a routerLink="/events">Alle Termine</a>
          </div>
          @for (event of upcomingEvents(); track event.id ?? event.title) {
            <a class="summary-row" [routerLink]="['/events', event.id]">
              <span>{{ event.title }}</span>
              <small>{{ event.dateTime | slice: 0 : 16 }} · {{ event.location }}</small>
            </a>
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
  private readonly taskService = inject(TaskService);
  readonly auth = inject(KeycloakAuthService);
  readonly events = signal<Event[]>([]);
  readonly tasks = signal<Task[]>([]);
  readonly openTasks = computed(() => this.tasks().filter((task) => !task.completed));
  readonly upcomingEvents = computed(() => [...this.events()].sort((a, b) => a.dateTime.localeCompare(b.dateTime)).slice(0, 5));

  ngOnInit(): void {
    forkJoin({ events: this.eventService.getAll(), tasks: this.taskService.getAll() }).subscribe({
      next: ({ events, tasks }) => {
        this.events.set(events);
        this.tasks.set(tasks);
      },
    });
  }
}