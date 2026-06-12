import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { EventService } from '../../../../core/api/event.service';
import { Event } from '../../../../core/models/event';

@Component({
  selector: 'app-event-form-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatButtonModule, MatCardModule, MatFormFieldModule, MatIconModule, MatInputModule],
  template: `
    <section class="page">
      <header class="page-header">
        <div>
          <h1 class="page-title">{{ isEdit() ? 'Termin bearbeiten' : 'Termin erstellen' }}</h1>
          <p class="page-subtitle">CRUD-Anbindung an den Backend-Controller /api/event.</p>
        </div>
        <a mat-stroked-button routerLink="/events">
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
            <mat-label>Ort</mat-label>
            <input matInput formControlName="location" />
            @if (form.controls.location.invalid && form.controls.location.touched) {
              <mat-error>Ort ist erforderlich.</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Datum und Zeit</mat-label>
            <input matInput type="datetime-local" formControlName="dateTime" />
            @if (form.controls.dateTime.invalid && form.controls.dateTime.touched) {
              <mat-error>Datum und Zeit sind erforderlich.</mat-error>
            }
          </mat-form-field>

          <mat-form-field class="full" appearance="outline">
            <mat-label>Beschreibung</mat-label>
            <textarea matInput formControlName="description" rows="5"></textarea>
            @if (form.controls.description.invalid && form.controls.description.touched) {
              <mat-error>Beschreibung ist erforderlich.</mat-error>
            }
          </mat-form-field>

          <div class="toolbar full">
            <button mat-flat-button type="submit" [disabled]="form.invalid">
              <mat-icon>save</mat-icon>
              Speichern
            </button>
            <a mat-stroked-button routerLink="/events">Abbrechen</a>
          </div>
        </form>
      </mat-card>
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
