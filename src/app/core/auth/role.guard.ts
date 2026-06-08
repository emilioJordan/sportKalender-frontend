import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AppRole } from '../models/auth';
import { KeycloakAuthService } from './keycloak.service';

export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(KeycloakAuthService);
  const router = inject(Router);
  const roles = (route.data['roles'] ?? []) as AppRole[];

  if (!auth.authenticated()) {
    void auth.login();
    return false;
  }

  if (!roles.length || auth.hasAnyRole(roles)) {
    return true;
  }

  return router.parseUrl('/forbidden');
};