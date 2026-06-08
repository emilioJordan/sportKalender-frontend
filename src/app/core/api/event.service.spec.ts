import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { EventService } from './event.service';
import { environment } from '../../../environments/environment';

describe('EventService', () => {
  let service: EventService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(EventService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads all events from the backend API', () => {
    service.getAll().subscribe((events) => expect(events).toHaveLength(1));
    const request = http.expectOne(`${environment.apiUrl}/api/event`);
    expect(request.request.method).toBe('GET');
    request.flush([{ id: 1, title: 'Training', location: 'Hall', description: 'Team', dateTime: '2026-06-08T18:30:00' }]);
  });
});