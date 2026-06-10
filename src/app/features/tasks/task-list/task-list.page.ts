import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { TaskService } from '../../../core/api/task.service';
import { KeycloakAuthService } from '../../../core/auth/keycloak.service';
import { Task } from '../../../core/models/task';

@Component({
  selector: 'app-task-list-page',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatCardModule, MatIconModule],
  template: `
    <section class="page">
      <header class="page-header">
        <div>
          <h1 class="page-title">Aufgaben</h1>
          <p class="page-subtitle">Aufgaben für Termine planen und erledigen.</p>
        </div>
        @if (auth.hasRole('UPDATE')) {
          <a mat-flat-button routerLink="/tasks/new">
            <mat-icon>add_task</mat-icon>
            Aufgabe erstellen
          </a>
        }
      </header>

      <section class="grid">
        @for (task of tasks(); track task.id ?? task.title) {
          <mat-card class="card task-card">
            <mat-card-content>
              <span class="status-pill" [class.good]="task.completed" [class.warn]="!task.completed">{{ task.completed ? 'Erledigt' : 'Offen' }}</span>
              <h2>{{ task.title }}</h2>
              <p>{{ task.description }}</p>
              @if (task.event?.id) {
                <small class="muted">Event-ID: {{ task.event?.id }}</small>
              }
            </mat-card-content>
            @if (auth.hasRole('UPDATE')) {
              <mat-card-actions class="actions">
                <button mat-stroked-button type="button" (click)="toggle(task)">
                  <mat-icon>{{ task.completed ? 'undo' : 'done' }}</mat-icon>
                  {{ task.completed ? 'Wieder öffnen' : 'Abschließen' }}
                </button>
                <a mat-stroked-button [routerLink]="['/tasks', task.id, 'edit']">
                  <mat-icon>edit</mat-icon>
                  Bearbeiten
                </a>
                <button mat-stroked-button type="button" color="warn" (click)="delete(task)">
                  <mat-icon>delete</mat-icon>
                  Löschen
                </button>
              </mat-card-actions>
            }
          </mat-card>
        } @empty {
          <p class="panel muted">Noch keine Aufgaben vorhanden.</p>
        }
      </section>
    </section>
  `,
  styles: `
    .task-card { align-items: center; display: flex; gap: 1rem; justify-content: space-between; padding: 1rem; }
    h2 { margin: 0.45rem 0 0.25rem; }
    p { margin: 0 0 0.35rem; }
    .actions { display: flex; flex-wrap: wrap; gap: 0.45rem; justify-content: end; }
    @media (max-width: 760px) { .task-card { align-items: stretch; flex-direction: column; } .actions { justify-content: start; } }
  `,
})
export class TaskListPage implements OnInit {
  private readonly taskService = inject(TaskService);
  readonly auth = inject(KeycloakAuthService);
  readonly tasks = signal<Task[]>([]);

  ngOnInit(): void {
    this.load();
  }

  toggle(task: Task): void {
    if (!task.id) {
      return;
    }
    this.taskService.update(task.id, { ...task, completed: !task.completed }).subscribe(() => this.load());
  }

  delete(task: Task): void {
    if (!task.id || !confirm(`Aufgabe "${task.title}" wirklich löschen?`)) {
      return;
    }
    this.taskService.delete(task.id).subscribe(() => this.load());
  }

  private load(): void {
    this.taskService.getAll().subscribe((tasks) => this.tasks.set(tasks));
  }
}
