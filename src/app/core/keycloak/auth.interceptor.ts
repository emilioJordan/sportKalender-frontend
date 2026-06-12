import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { KeycloakAuthService } from './keycloak.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(KeycloakAuthService);

  if (!request.url.startsWith(environment.apiUrl)) {
    return next(request);
  }

  return from(auth.getToken()).pipe(
    switchMap((token) => {
      const authorizedRequest = token
        ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
        : request;
      return next(authorizedRequest);
    }),
  );
};