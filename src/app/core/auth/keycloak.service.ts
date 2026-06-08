import { Injectable, signal } from '@angular/core';
import Keycloak from 'keycloak-js';
import { environment } from '../../../environments/environment';
import { AppRole } from '../models/auth';

@Injectable({ providedIn: 'root' })
export class KeycloakAuthService {
  private readonly keycloak = new Keycloak(environment.keycloak);
  readonly authenticated = signal(false);
  readonly username = signal('Gast');
  readonly roles = signal<string[]>([]);

  async init(): Promise<void> {
    try {
      const authenticated = await this.keycloak.init({
        onLoad: 'check-sso',
        pkceMethod: 'S256',
        silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
      });
      this.syncState(authenticated);
      this.keycloak.onTokenExpired = () => void this.keycloak.updateToken(30).then(() => this.syncState(true));
    } catch {
      this.syncState(false);
    }
  }

  login(): Promise<void> {
    return this.keycloak.login({ redirectUri: window.location.origin });
  }

  logout(): Promise<void> {
    return this.keycloak.logout({ redirectUri: window.location.origin });
  }

  account(): Promise<void> {
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

  private syncState(authenticated: boolean): void {
    this.authenticated.set(authenticated);
    this.username.set(this.keycloak.tokenParsed?.['preferred_username']?.toString() ?? 'Gast');
    this.roles.set(this.collectRoles());
  }

  private collectRoles(): string[] {
    const token = this.keycloak.tokenParsed;
    const realmRoles = token?.realm_access?.roles ?? [];
    const clientRoles = Object.values(token?.resource_access ?? {}).flatMap((entry) => entry.roles ?? []);
    return [...new Set([...realmRoles, ...clientRoles].map((role) => role.toUpperCase()))];
  }
}