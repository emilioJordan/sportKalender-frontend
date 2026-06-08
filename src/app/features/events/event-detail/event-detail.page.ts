import { SlicePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { EventService } from '../../../core/api/event.service';
import { TaskService } from '../../../core/api/task.service';
import { KeycloakAuthService } from '../../../core/auth/keycloak.service';
import { Event } from '../../../core/models/event';
import { Task } from '../../../core/models/task';

@Component({
  selector: 'app-event-detail-page',
  standalone: true,
  imports: [RouterLink, SlicePipe],
  template: `
    @if (event(); as currentEvent) {
      <section class="page">
        <header class="page-header">
          <div>
            <h1 class="page-title">{{ currentEvent.title }}</h1>
            <p class="page-subtitle">{{ currentEvent.dateTime | slice: 0 : 16 }} · {{ currentEvent.location }}</p>
          </div>
          <div class="toolbar">
            <a class="button secondary" routerLink="/events">Zurück</a>
            @if (auth.hasRole('UPDATE')) {
              <a class="button" [routerLink]="['/events', currentEvent.id, 'edit']">Bearbeiten</a>
            }
          </div>
        </header>

        <article class="panel stack">
          <h2>Beschreibung</h2>
          <p>{{ currentEvent.description }}</p>
        </article>

        <section class="panel stack">
          <div class="toolbar">
            <h2>Zugeordnete Aufgaben</h2>
            @if (auth.hasRole('UPDATE')) {
              <a class="button secondary" routerLink="/tasks/new">Aufgabe erfassen</a>
            }
          </div>
          @for (task of linkedTasks(); track task.id ?? task.title) {
            <div class="task-row">
              <span class="status-pill" [class.good]="task.completed">{{ task.completed ? 'Erledigt' : 'Offen' }}</span>
              <strong>{{ task.title }}</strong>
              <span class="muted">{{ task.description }}</span>
            </div>
          } @empty {
            <p class="muted">Keine Aufgaben für diesen Termin.</p>
          }
        </section>
      </section>
    }
  `,
  styles: `
    h2 { margin: 0; }
    .task-row { align-items: center; border: 1px solid var(--border); border-radius: 6px; display: grid; gap: 0.45rem; grid-template-columns: auto 1fr 2fr; padding: 0.75rem; }
    @media (max-width: 700px) { .task-row { grid-template-columns: 1fr; } }
  `,
})
export class EventDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly eventService = inject(EventService);
  private readonly taskService = inject(TaskService);
  readonly auth = inject(KeycloakAuthService);
  readonly event = signal<Event | null>(null);
  readonly tasks = signal<Task[]>([]);
  readonly linkedTasks = computed(() => this.tasks().filter((task) => task.event?.id === this.event()?.id));

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    forkJoin({ event: this.eventService.getById(id), tasks: this.taskService.getAll() }).subscribe(({ event, tasks }) => {
      this.event.set(event);
      this.tasks.set(tasks);
    });
  }
}