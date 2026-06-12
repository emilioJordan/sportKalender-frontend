import { SlicePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { EventService } from '../../../../core/api/event.service';
import { KeycloakAuthService } from '../../../../core/keycloak/keycloak.service';
import { Event } from '../../../../core/models/event';

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
      </section>
    }
  `,
  styles: `
    h2 { margin: 0; }
  `,
})
export class EventDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly eventService = inject(EventService);
  readonly auth = inject(KeycloakAuthService);
  readonly event = signal<Event | null>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.eventService.getById(id).subscribe((event) => this.event.set(event));
  }
}
