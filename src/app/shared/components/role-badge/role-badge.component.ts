import { Component, input } from '@angular/core';

@Component({
  selector: 'app-role-badge',
  standalone: true,
  template: `<span class="role" [class.update]="role().toUpperCase() === 'UPDATE'" [class.admin]="role().toUpperCase() === 'ADMIN'">{{ role() }}</span>`,
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

    .role.admin {
      background: #fff1f2;
      border-color: #fecdd3;
      color: #9f1239;
    }
  `,
})
export class RoleBadgeComponent {
  readonly role = input.required<string>();
}
