import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forbidden-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="panel stack">
      <span class="status-pill warn">403</span>
      <h1>Zugriff nicht erlaubt</h1>
      <p class="muted">Diese Funktion ist für Benutzer mit der Rolle UPDATE reserviert.</p>
      <a class="button secondary" routerLink="/">Zur Übersicht</a>
    </section>
  `,
})
export class ForbiddenPage {}