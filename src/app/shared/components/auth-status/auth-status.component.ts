import { Component, inject } from '@angular/core';
import { KeycloakAuthService } from '../../../core/auth/keycloak.service';
import { RoleBadgeComponent } from '../role-badge/role-badge.component';

@Component({
  selector: 'app-auth-status',
  standalone: true,
  imports: [RoleBadgeComponent],
  template: `
    <section class="auth-status" aria-label="Authentifizierung">
      @if (auth.authenticated()) {
        <div>
          <strong>{{ auth.username() }}</strong>
          <div class="roles">
            @for (role of auth.roles(); track role) {
              <app-role-badge [role]="role" />
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
  `,
  styles: `
    .auth-status {
      align-items: center;
      display: flex;
      flex-wrap: wrap;
      gap: 0.55rem;
      justify-content: end;
    }

    .roles {
      display: flex;
      flex-wrap: wrap;
      gap: 0.3rem;
      margin-top: 0.25rem;
    }
  `,
})
export class AuthStatusComponent {
  readonly auth = inject(KeycloakAuthService);
}