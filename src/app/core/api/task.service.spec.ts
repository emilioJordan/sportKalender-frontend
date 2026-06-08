import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { TaskService } from './task.service';

describe('TaskService', () => {
  let service: TaskService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(TaskService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('updates tasks through the backend API', () => {
    const task = { id: 4, title: 'Material', description: 'Prepare balls', completed: true };

    service.update(4, task).subscribe((updated) => expect(updated.completed).toBe(true));

    const request = http.expectOne(`${environment.apiUrl}/api/task/4`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(task);
    request.flush(task);
  });
});