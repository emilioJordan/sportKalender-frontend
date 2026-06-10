import { Injectable, signal } from '@angular/core';
import Keycloak from 'keycloak-js';
import { environment } from '../../../environments/environment';
import { AppRole } from '../models/auth';

@Injectable({ providedIn: 'root' })
export class KeycloakAuthService {
  private keycloak = this.createClient();
  private initialized = false;
  readonly authenticated = signal(false);
  readonly available = signal(false);
  readonly username = signal('Gast');
  readonly roles = signal<AppRole[]>([]);
  readonly loginPending = signal(false);
  readonly authMessage = signal('');

  async init(): Promise<void> {
    try {
      const available = await this.checkAvailability();

      if (!available) {
        this.syncState(false);
        return;
      }

      const authenticated = await this.initializeKeycloak();
      this.available.set(true);
      this.syncState(authenticated);
    } catch {
      this.keycloak = this.createClient();
      this.initialized = false;
      this.available.set(false);
      this.syncState(false);
    }
  }

  async login(): Promise<void> {
    this.loginPending.set(true);
    this.authMessage.set('');

    const available = this.available() || (await this.checkAvailability());

    if (!available) {
      this.syncState(false);
      this.authMessage.set('Keycloak ist nicht erreichbar. Starte Keycloak auf http://localhost:8080 und klicke danach auf Prüfen.');
      this.loginPending.set(false);
      return;
    }

    try {
      await this.initializeKeycloak();
      await this.keycloak.login({ redirectUri: window.location.origin });
    } catch {
      this.authMessage.set('Login konnte nicht gestartet werden. Prüfe Realm, Client-ID und Redirect-URI in Keycloak.');
      this.loginPending.set(false);
    }
  }

  logout(): Promise<void> {
    if (!this.available()) {
      this.syncState(false);
      return Promise.resolve();
    }

    return this.keycloak.logout({ redirectUri: window.location.origin });
  }

  account(): Promise<void> {
    if (!this.available()) {
      return Promise.resolve();
    }

    return this.keycloak.accountManagement();
  }

  async getToken(): Promise<string | undefined> {
    if (!this.authenticated()) {
      return undefined;
    }
    await this.keycloak.updateToken(30);
    return this.keycloak.token;
  }

  hasRole(role: AppRole): boolean {
    return this.roles().includes(role);
  }

  hasAnyRole(roles: AppRole[]): boolean {
    return roles.some((role) => this.hasRole(role));
  }

  async refreshAvailability(): Promise<void> {
    this.authMessage.set('');
    const available = await this.checkAvailability();

    if (!available) {
      this.authMessage.set('Keycloak ist weiterhin nicht erreichbar. Erwartet wird http://localhost:8080/realms/Sportkalender.');
    }
  }

  private async checkAvailability(): Promise<boolean> {
    try {
      const response = await fetch(
        `${environment.keycloak.url}/realms/${environment.keycloak.realm}/.well-known/openid-configuration`,
        { cache: 'no-store' },
      );
      this.available.set(response.ok);
      return response.ok;
    } catch {
      this.available.set(false);
      return false;
    }
  }

  private async initializeKeycloak(): Promise<boolean> {
    if (this.initialized) {
      return this.authenticated();
    }

    const authenticated = await this.keycloak.init({
      onLoad: 'check-sso',
      pkceMethod: 'S256',
      silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
    });
    this.initialized = true;
    this.keycloak.onTokenExpired = () => void this.keycloak.updateToken(30).then(() => this.syncState(true));
    this.syncState(authenticated);
    return authenticated;
  }

  private createClient(): Keycloak {
    return new Keycloak(environment.keycloak);
  }

  private syncState(authenticated: boolean): void {
    this.authenticated.set(authenticated);
    this.username.set(this.keycloak.tokenParsed?.['preferred_username']?.toString() ?? 'Gast');
    this.roles.set(this.collectRoles());
  }

  private collectRoles(): AppRole[] {
    const token = this.keycloak.tokenParsed;
    const realmRoles = token?.realm_access?.roles ?? [];
    const clientRoles = Object.values(token?.resource_access ?? {}).flatMap((entry) => entry.roles ?? []);
    const rawRoles = new Set([...realmRoles, ...clientRoles].map((role) => role.toUpperCase()));
    const roles = new Set<AppRole>();

    if (rawRoles.has('READ') || rawRoles.has('USER') || rawRoles.has('ROLE_USER') || rawRoles.has('UPDATE') || rawRoles.has('ADMIN') || rawRoles.has('ROLE_ADMIN')) {
      roles.add('READ');
    }

    if (rawRoles.has('UPDATE') || rawRoles.has('ADMIN') || rawRoles.has('ROLE_ADMIN')) {
      roles.add('UPDATE');
    }

    return [...roles];
  }
}
