import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { forkJoin } from 'rxjs';
import { EventService } from '../../../core/api/event.service';
import { TaskService } from '../../../core/api/task.service';
import { Event } from '../../../core/models/event';
import { Task } from '../../../core/models/task';

@Component({
  selector: 'app-task-form-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatButtonModule, MatCardModule, MatCheckboxModule, MatFormFieldModule, MatIconModule, MatInputModule, MatSelectModule],
  template: `
    <section class="page">
      <header class="page-header">
        <div>
          <h1 class="page-title">{{ isEdit() ? 'Aufgabe bearbeiten' : 'Aufgabe erstellen' }}</h1>
          <p class="page-subtitle">Aufgaben können optional einem Termin zugeordnet werden.</p>
        </div>
        <a mat-stroked-button routerLink="/tasks">
          <mat-icon>arrow_back</mat-icon>
          Zurück
        </a>
      </header>

      <mat-card class="material-panel">
        <form class="material-form" [formGroup]="form" (ngSubmit)="save()">
          <mat-form-field appearance="outline">
            <mat-label>Titel</mat-label>
            <input matInput formControlName="title" />
            @if (form.controls.title.invalid && form.controls.title.touched) {
              <mat-error>Titel ist erforderlich.</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Termin</mat-label>
            <mat-select formControlName="eventId">
              <mat-option value="">Ohne Termin</mat-option>
            @for (event of events(); track event.id ?? event.title) {
                <mat-option [value]="event.id?.toString()">{{ event.title }}</mat-option>
            }
            </mat-select>
          </mat-form-field>

          <mat-form-field class="full" appearance="outline">
            <mat-label>Beschreibung</mat-label>
            <textarea matInput formControlName="description" rows="5"></textarea>
            @if (form.controls.description.invalid && form.controls.description.touched) {
              <mat-error>Beschreibung ist erforderlich.</mat-error>
            }
          </mat-form-field>

          <mat-checkbox class="full" formControlName="completed">Aufgabe ist erledigt</mat-checkbox>

          <div class="toolbar full">
            <button mat-flat-button type="submit" [disabled]="form.invalid">
              <mat-icon>save</mat-icon>
              Speichern
            </button>
            <a mat-stroked-button routerLink="/tasks">Abbrechen</a>
          </div>
        </form>
      </mat-card>
    </section>
  `,
})
export class TaskFormPage implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly taskService = inject(TaskService);
  private readonly eventService = inject(EventService);
  readonly taskId = signal<number | null>(null);
  readonly events = signal<Event[]>([]);
  readonly isEdit = computed(() => this.taskId() !== null);

  readonly form = this.formBuilder.nonNullable.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    completed: [false],
    eventId: [''],
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.taskId.set(id);
      forkJoin({ events: this.eventService.getAll(), task: this.taskService.getById(id) }).subscribe(({ events, task }) => {
        this.events.set(events);
        this.form.setValue({
          title: task.title,
          description: task.description,
          completed: task.completed,
          eventId: task.event?.id?.toString() ?? '',
        });
      });
      return;
    }

    this.eventService.getAll().subscribe((events) => this.events.set(events));
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const task: Task = {
      title: value.title,
      description: value.description,
      completed: value.completed,
      event: value.eventId ? { id: Number(value.eventId) } : undefined,
    };
    const request = this.taskId() ? this.taskService.update(this.taskId()!, task) : this.taskService.create(task);
    request.subscribe(() => void this.router.navigate(['/tasks']));
  }
}
