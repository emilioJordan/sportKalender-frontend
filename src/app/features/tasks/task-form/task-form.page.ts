import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { EventService } from '../../../core/api/event.service';
import { TaskService } from '../../../core/api/task.service';
import { Event } from '../../../core/models/event';
import { Task } from '../../../core/models/task';

@Component({
  selector: 'app-task-form-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="page">
      <header class="page-header">
        <div>
          <h1 class="page-title">{{ isEdit() ? 'Aufgabe bearbeiten' : 'Aufgabe erstellen' }}</h1>
          <p class="page-subtitle">Aufgaben können optional einem Termin zugeordnet werden.</p>
        </div>
        <a class="button secondary" routerLink="/tasks">Zurück</a>
      </header>

      <form class="panel form-grid" [formGroup]="form" (ngSubmit)="save()">
        <label class="field">
          <span>Titel</span>
          <input formControlName="title" />
        </label>
        <label class="field">
          <span>Termin</span>
          <select formControlName="eventId">
            <option value="">Ohne Termin</option>
            @for (event of events(); track event.id ?? event.title) {
              <option [value]="event.id">{{ event.title }}</option>
            }
          </select>
        </label>
        <label class="field full">
          <span>Beschreibung</span>
          <textarea formControlName="description"></textarea>
        </label>
        <label class="field full checkbox-field">
          <input type="checkbox" formControlName="completed" />
          <span>Aufgabe ist erledigt</span>
        </label>
        <div class="toolbar field full">
          <button type="submit" [disabled]="form.invalid">Speichern</button>
          <a class="button secondary" routerLink="/tasks">Abbrechen</a>
        </div>
      </form>
    </section>
  `,
  styles: `.checkbox-field { align-items: center; display: flex; flex-direction: row; } .checkbox-field input { min-height: auto; width: auto; }`,
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