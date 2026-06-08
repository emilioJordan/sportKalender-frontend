import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { KeycloakAuthService } from '../../../core/auth/keycloak.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <header class="shell-header">
      <a class="brand" routerLink="/" aria-label="SportKalender Übersicht">
        <span class="brand-mark">SK</span>
        <span>
          <strong>SportKalender</strong>
          <small>Event- und Aufgabenplanung</small>
        </span>
      </a>

      <nav aria-label="Hauptnavigation">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Übersicht</a>
        <a routerLink="/events" routerLinkActive="active">Termine</a>
        <a routerLink="/tasks" routerLinkActive="active">Aufgaben</a>
        @if (auth.hasRole('UPDATE')) {
          <a routerLink="/events/new" routerLinkActive="active">Neuer Termin</a>
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
          <button class="secondary" type="button" (click)="auth.account()">Profil</button>
          <button type="button" (click)="auth.logout()">Abmelden</button>
        } @else {
          <span class="muted">Nicht angemeldet</span>
          <button type="button" (click)="auth.login()">Anmelden</button>
        }
      </section>
    </header>

    <main class="shell-main">
      <router-outlet />
    </main>
  `,
  styleUrl: './app-shell.component.scss',
})
export class AppShellComponent {
  readonly auth = inject(KeycloakAuthService);
}