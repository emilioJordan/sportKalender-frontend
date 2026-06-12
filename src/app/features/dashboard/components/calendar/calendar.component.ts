import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Event } from '../../../../core/models/event';

interface CalendarDay {
  date: Date;
  isoDate: string;
  dayNumber: number;
  inCurrentMonth: boolean;
  isToday: boolean;
  events: Event[];
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="calendar-shell panel">
      <div class="calendar-toolbar">
        <div class="calendar-actions">
          <button class="secondary" type="button" (click)="previousMonth()">‹ Zurück</button>
          <button class="secondary" type="button" (click)="goToday()">Heute</button>
          <button class="secondary" type="button" (click)="nextMonth()">Weiter ›</button>
        </div>
        <div class="calendar-title">
          <strong>{{ monthLabel }}</strong>
          <span>Monatsansicht</span>
        </div>
        <a class="button secondary" routerLink="/events">Terminliste</a>
      </div>

      <div class="calendar-grid weekday-row" aria-hidden="true">
        @for (weekday of weekdays; track weekday) {
          <div>{{ weekday }}</div>
        }
      </div>

      <div class="calendar-grid month-grid">
        @for (day of calendarDays; track day.isoDate) {
          <article class="calendar-day" [class.muted-day]="!day.inCurrentMonth" [class.today]="day.isToday">
            <div class="day-head">
              <span>{{ day.dayNumber }}</span>
              @if (day.isToday) {
                <small>Heute</small>
              }
            </div>

            <div class="day-events">
              @for (event of day.events; track event.id ?? event.title) {
                @if (demoMode) {
                  <div class="calendar-event demo-event" [title]="event.description">
                    <strong>{{ eventTime(event) }} {{ event.title }}</strong>
                    <span>{{ event.location }}</span>
                  </div>
                } @else {
                  <a class="calendar-event" [routerLink]="['/events', event.id]" [title]="event.description">
                    <strong>{{ eventTime(event) }} {{ event.title }}</strong>
                    <span>{{ event.location }}</span>
                  </a>
                }
              }
            </div>
          </article>
        }
      </div>
    </section>
  `,
  styles: `
    .calendar-shell {
      display: grid;
      gap: 0.75rem;
      padding: 1rem;
    }

    .calendar-toolbar {
      align-items: center;
      display: grid;
      gap: 0.75rem;
      grid-template-columns: 1fr auto 1fr;
    }

    .calendar-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.45rem;
    }

    .calendar-title {
      display: grid;
      justify-items: center;
      text-align: center;
    }

    .calendar-title strong {
      font-size: 1.15rem;
      text-transform: capitalize;
    }

    .calendar-title span {
      color: var(--muted);
      font-size: 0.82rem;
      font-weight: 800;
      text-transform: uppercase;
    }

    .calendar-grid {
      display: grid;
      grid-template-columns: repeat(7, minmax(0, 1fr));
    }

    .weekday-row {
      background: var(--surface-muted);
      border: 1px solid var(--border);
      border-bottom: 0;
      border-radius: 8px 8px 0 0;
      color: var(--muted);
      font-size: 0.82rem;
      font-weight: 900;
      text-align: center;
      text-transform: uppercase;
    }

    .weekday-row div {
      padding: 0.55rem;
    }

    .month-grid {
      border-left: 1px solid var(--border);
      border-top: 1px solid var(--border);
    }

    .calendar-day {
      background: #fff;
      border-bottom: 1px solid var(--border);
      border-right: 1px solid var(--border);
      min-height: 7.6rem;
      padding: 0.45rem;
    }

    .calendar-day.today {
      background: #fef9c3;
    }

    .calendar-day.muted-day {
      background: #f8fafc;
      color: #a7b1bd;
    }

    .day-head {
      align-items: center;
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.35rem;
    }

    .day-head span {
      font-weight: 900;
    }

    .day-head small {
      color: var(--primary-strong);
      font-size: 0.72rem;
      font-weight: 900;
    }

    .day-events {
      display: grid;
      gap: 0.25rem;
    }

    .calendar-event {
      background: var(--primary);
      border-radius: 4px;
      color: #fff;
      display: grid;
      gap: 0.05rem;
      overflow: hidden;
      padding: 0.25rem 0.35rem;
      text-decoration: none;
    }

    .calendar-event:nth-child(2n) {
      background: var(--accent);
    }

    .calendar-event:nth-child(3n) {
      background: #6d5bd0;
    }

    .demo-event {
      cursor: default;
    }

    .calendar-event strong,
    .calendar-event span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .calendar-event strong {
      font-size: 0.76rem;
    }

    .calendar-event span {
      font-size: 0.72rem;
      opacity: 0.88;
    }

    @media (max-width: 900px) {
      .calendar-toolbar {
        grid-template-columns: 1fr;
      }

      .calendar-title {
        justify-items: start;
        text-align: left;
      }

      .calendar-grid {
        min-width: 760px;
      }

      .calendar-shell {
        overflow-x: auto;
      }
    }
  `,
})
export class CalendarComponent {
  @Input({ required: true }) events: Event[] = [];
  @Input({ required: true }) selectedMonth = new Date();
  @Input() demoMode = false;
  @Output() readonly selectedMonthChange = new EventEmitter<Date>();

  readonly weekdays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

  get monthLabel(): string {
    return new Intl.DateTimeFormat('de-CH', { month: 'long', year: 'numeric' }).format(this.selectedMonth);
  }

  get calendarDays(): CalendarDay[] {
    const firstOfMonth = new Date(this.selectedMonth.getFullYear(), this.selectedMonth.getMonth(), 1);
    const mondayOffset = (firstOfMonth.getDay() + 6) % 7;
    const start = new Date(firstOfMonth);
    start.setDate(firstOfMonth.getDate() - mondayOffset);

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      const isoDate = this.toIsoDate(date);

      return {
        date,
        isoDate,
        dayNumber: date.getDate(),
        inCurrentMonth: date.getMonth() === this.selectedMonth.getMonth(),
        isToday: isoDate === this.toIsoDate(new Date()),
        events: this.events.filter((event) => this.toIsoDate(this.eventDate(event)) === isoDate),
      };
    });
  }

  previousMonth(): void {
    this.setSelectedMonth(new Date(this.selectedMonth.getFullYear(), this.selectedMonth.getMonth() - 1, 1));
  }

  nextMonth(): void {
    this.setSelectedMonth(new Date(this.selectedMonth.getFullYear(), this.selectedMonth.getMonth() + 1, 1));
  }

  goToday(): void {
    this.setSelectedMonth(new Date());
  }

  eventTime(event: Event): string {
    return new Intl.DateTimeFormat('de-CH', { hour: '2-digit', minute: '2-digit' }).format(this.eventDate(event));
  }

  private setSelectedMonth(month: Date): void {
    this.selectedMonthChange.emit(month);
  }

  private eventDate(event: Event): Date {
    return new Date(event.dateTime);
  }

  private toIsoDate(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
}
