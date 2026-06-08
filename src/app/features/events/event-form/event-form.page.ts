import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EventService } from '../../../core/api/event.service';
import { Event } from '../../../core/models/event';

@Component({
  selector: 'app-event-form-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="page">
      <header class="page-header">
        <div>
          <h1 class="page-title">{{ isEdit() ? 'Termin bearbeiten' : 'Termin erstellen' }}</h1>
          <p class="page-subtitle">CRUD-Anbindung an den Backend-Controller /api/event.</p>
        </div>
        <a class="button secondary" routerLink="/events">Zurück</a>
      </header>

      <form class="panel form-grid" [formGroup]="form" (ngSubmit)="save()">
        <label class="field">
          <span>Titel</span>
          <input formControlName="title" />
          @if (form.controls.title.invalid && form.controls.title.touched) { <small class="error">Titel ist erforderlich.</small> }
        </label>
        <label class="field">
          <span>Ort</span>
          <input formControlName="location" />
        </label>
        <label class="field">
          <span>Datum und Zeit</span>
          <input type="datetime-local" formControlName="dateTime" />
        </label>
        <label class="field full">
          <span>Beschreibung</span>
          <textarea formControlName="description"></textarea>
        </label>
        <div class="toolbar field full">
          <button type="submit" [disabled]="form.invalid">Speichern</button>
          <a class="button secondary" routerLink="/events">Abbrechen</a>
        </div>
      </form>
    </section>
  `,
})
export class EventFormPage implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly eventService = inject(EventService);
  readonly eventId = signal<number | null>(null);
  readonly isEdit = computed(() => this.eventId() !== null);

  readonly form = this.formBuilder.nonNullable.group({
    title: ['', Validators.required],
    location: ['', Validators.required],
    description: ['', Validators.required],
    dateTime: ['', Validators.required],
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.eventId.set(id);
      this.eventService.getById(id).subscribe((event) => this.form.setValue({
        title: event.title,
        location: event.location,
        description: event.description,
        dateTime: event.dateTime.slice(0, 16),
      }));
    }
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const event: Event = { ...this.form.getRawValue(), dateTime: this.form.controls.dateTime.value };
    const request = this.eventId()
      ? this.eventService.update(this.eventId()!, event)
      : this.eventService.create(event);

    request.subscribe((saved) => void this.router.navigate(['/events', saved.id ?? '']));
  }
}