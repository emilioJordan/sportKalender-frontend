import { Component, input } from '@angular/core';

@Component({
  selector: 'app-role-badge',
  standalone: true,
  template: `<span class="role" [class.update]="role().toUpperCase() === 'UPDATE'">{{ role() }}</span>`,
  styles: `
    .role {
      background: #edf5f8;
      border: 1px solid #c9dce4;
      border-radius: 999px;
      color: var(--primary-strong);
      display: inline-flex;
      font-size: 0.72rem;
      font-weight: 900;
      padding: 0.18rem 0.45rem;
    }

    .role.update {
      background: #eaf7ef;
      border-color: #b9dfc5;
      color: #1d6a3a;
    }
  `,
})
export class RoleBadgeComponent {
  readonly role = input.required<string>();
}