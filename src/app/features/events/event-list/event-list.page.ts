import { SlicePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EventService } from '../../../core/api/event.service';
import { KeycloakAuthService } from '../../../core/auth/keycloak.service';
import { Event } from '../../../core/models/event';

@Component({
  selector: 'app-event-list-page',
  standalone: true,
  imports: [RouterLink, SlicePipe],
  template: `
    <section class="page">
      <header class="page-header">
        <div>
          <h1 class="page-title">Termine</h1>
          <p class="page-subtitle">Trainings, Turniere und Vereinsanlässe verwalten.</p>
        </div>
        @if (auth.hasRole('UPDATE')) {
          <a class="button" routerLink="/events/new">Termin erstellen</a>
        }
      </header>

      <section class="panel table-wrap">
        <table>
          <thead>
            <tr>
              <th>Titel</th>
              <th>Datum</th>
              <th>Ort</th>
              <th>Beschreibung</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            @for (event of events(); track event.id ?? event.title) {
              <tr>
                <td><strong>{{ event.title }}</strong></td>
                <td>{{ event.dateTime | slice: 0 : 16 }}</td>
                <td>{{ event.location }}</td>
                <td>{{ event.description }}</td>
                <td class="actions">
                  <a class="button secondary" [routerLink]="['/events', event.id]">Details</a>
                  @if (auth.hasRole('UPDATE')) {
                    <a class="button secondary" [routerLink]="['/events', event.id, 'edit']">Bearbeiten</a>
                    <button class="danger" type="button" (click)="delete(event)">Löschen</button>
                  }
                </td>
              </tr>
            } @empty {
              <tr><td colspan="5" class="muted">Noch keine Termine vorhanden.</td></tr>
            }
          </tbody>
        </table>
      </section>
    </section>
  `,
  styles: `.actions { display: flex; flex-wrap: wrap; gap: 0.4rem; }`,
})
export class EventListPage implements OnInit {
  private readonly eventService = inject(EventService);
  readonly auth = inject(KeycloakAuthService);
  readonly events = signal<Event[]>([]);

  ngOnInit(): void {
    this.load();
  }

  delete(event: Event): void {
    if (!event.id || !confirm(`Termin "${event.title}" wirklich löschen?`)) {
      return;
    }
    this.eventService.delete(event.id).subscribe(() => this.load());
  }

  private load(): void {
    this.eventService.getAll().subscribe((events) => this.events.set(events));
  }
}