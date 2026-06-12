import { SlicePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { EventService } from '../../../../core/api/event.service';
import { KeycloakAuthService } from '../../../../core/keycloak/keycloak.service';
import { Event } from '../../../../core/models/event';

@Component({
  selector: 'app-event-list-page',
  standalone: true,
  imports: [RouterLink, SlicePipe, MatButtonModule, MatCardModule, MatIconModule, MatTableModule],
  template: `
    <section class="page">
      <header class="page-header">
        <div>
          <h1 class="page-title">Termine</h1>
          <p class="page-subtitle">Trainings, Turniere und Vereinsanlässe verwalten.</p>
        </div>
        @if (auth.hasRole('READ')) {
          <a mat-flat-button routerLink="/events/new">
            <mat-icon>add</mat-icon>
            Termin erstellen
          </a>
        }
      </header>

      <mat-card class="material-panel table-wrap">
        <table mat-table [dataSource]="events()">
          <ng-container matColumnDef="title">
            <th mat-header-cell *matHeaderCellDef>Titel</th>
            <td mat-cell *matCellDef="let event"><strong>{{ event.title }}</strong></td>
          </ng-container>

          <ng-container matColumnDef="dateTime">
            <th mat-header-cell *matHeaderCellDef>Datum</th>
            <td mat-cell *matCellDef="let event">{{ event.dateTime | slice: 0 : 16 }}</td>
          </ng-container>

          <ng-container matColumnDef="location">
            <th mat-header-cell *matHeaderCellDef>Ort</th>
            <td mat-cell *matCellDef="let event">{{ event.location }}</td>
          </ng-container>

          <ng-container matColumnDef="description">
            <th mat-header-cell *matHeaderCellDef>Beschreibung</th>
            <td mat-cell *matCellDef="let event">{{ event.description }}</td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Aktionen</th>
            <td mat-cell *matCellDef="let event" class="actions">
              <a mat-stroked-button [routerLink]="['/events', event.id]">
                <mat-icon>visibility</mat-icon>
                Details
              </a>
              @if (auth.hasRole('UPDATE')) {
                <a mat-stroked-button [routerLink]="['/events', event.id, 'edit']">
                  <mat-icon>edit</mat-icon>
                  Bearbeiten
                </a>
                @if (auth.hasRole('ADMIN')) {
                  <button mat-stroked-button type="button" color="warn" (click)="delete(event)">
                    <mat-icon>delete</mat-icon>
                    Löschen
                  </button>
                }
              }
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
        </table>

        @if (!events().length) {
          <p class="empty-state muted">Noch keine Termine vorhanden.</p>
        }
      </mat-card>
    </section>
  `,
  styles: `.actions { display: flex; flex-wrap: wrap; gap: 0.4rem; }`,
})
export class EventListPage implements OnInit {
  private readonly eventService = inject(EventService);
  readonly auth = inject(KeycloakAuthService);
  readonly events = signal<Event[]>([]);
  readonly displayedColumns = ['title', 'dateTime', 'location', 'description', 'actions'];

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
