import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { App } from './app';
import { KeycloakAuthService } from './core/keycloak/keycloak.service';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        {
          provide: KeycloakAuthService,
          useValue: {
            authenticated: () => false,
            username: () => 'Gast',
            roles: () => [],
            hasRole: () => false,
            login: () => Promise.resolve(),
            logout: () => Promise.resolve(),
            account: () => Promise.resolve(),
          },
        },
      ],
    }).compileComponents();
  });

  it('creates the app shell', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
  });
});
