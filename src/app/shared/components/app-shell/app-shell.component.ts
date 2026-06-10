import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { KeycloakAuthService } from '../../../core/auth/keycloak.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, MatButtonModule, MatIconModule, MatToolbarModule],
  template: `
    <mat-toolbar class="shell-header">
      <a class="brand" routerLink="/" aria-label="SportKalender Übersicht">
        <span class="brand-mark">SK</span>
        <span>
          <strong>SportKalender</strong>
          <small>Termin- und Aufgabenplanung</small>
        </span>
      </a>

      <nav aria-label="Hauptnavigation">
        <a mat-button routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
          <mat-icon>dashboard</mat-icon>
          Übersicht
        </a>
        <a mat-button routerLink="/events" routerLinkActive="active">
          <mat-icon>event</mat-icon>
          Termine
        </a>
        <a mat-button routerLink="/tasks" routerLinkActive="active">
          <mat-icon>checklist</mat-icon>
          Aufgaben
        </a>
        @if (auth.hasRole('UPDATE')) {
          <a mat-flat-button routerLink="/events/new" routerLinkActive="active">
            <mat-icon>add</mat-icon>
            Neuer Termin
          </a>
        }
      </nav>

      <section class="auth-status" aria-label="Authentifizierung">
        @if (auth.authenticated()) {
          <div>
            <strong>{{ auth.username() }}</strong>
            <div class="roles">
              @for (role of auth.roles(); track role) {
                <span class="role" [class.update]="role === 'UPDATE'">{{ role }}</span>
              }
            </div>
          </div>
          <button mat-stroked-button type="button" (click)="auth.account()">
            <mat-icon>account_circle</mat-icon>
            Profil
          </button>
          <button mat-flat-button type="button" (click)="auth.logout()">
            <mat-icon>logout</mat-icon>
            Abmelden
          </button>
        } @else {
          <span class="muted">Nicht angemeldet</span>
          @if (auth.available()) {
            <button mat-flat-button type="button" [disabled]="auth.loginPending()" (click)="auth.login()">
              <mat-icon>login</mat-icon>
              {{ auth.loginPending() ? 'Login wird gestartet' : 'Anmelden' }}
            </button>
          } @else {
            <span class="auth-hint">Keycloak offline</span>
            <button mat-stroked-button type="button" (click)="auth.refreshAvailability()">
              <mat-icon>sync</mat-icon>
              Prüfen
            </button>
          }
          @if (auth.authMessage()) {
            <span class="auth-hint">{{ auth.authMessage() }}</span>
          }
        }
      </section>
    </mat-toolbar>

    <main class="shell-main">
      <router-outlet />
    </main>
  `,
  styleUrl: './app-shell.component.scss',
})
export class AppShellComponent {
  readonly auth = inject(KeycloakAuthService);
}
