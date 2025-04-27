import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { EventService } from './event.service';

describe('EventService', () => {
  let service: EventService;
  let httpMock: HttpTestingController;

  const baseUrl = 'http://localhost:8089/events/api/events';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EventService]
    });

    service = TestBed.inject(EventService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all events', () => {
    const mockEvents = [{ id: 1, name: 'Event 1' }, { id: 2, name: 'Event 2' }];

    service.getAllEvents().subscribe(events => {
      expect(events.length).toBe(2);
      expect(events).toEqual(mockEvents);
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockEvents);
  });

  it('should delete an event by ID', () => {
    const eventId = 1;

    service.deleteEvent(eventId).subscribe(response => {
      expect(response.status).toBe(200);
    });

    const req = httpMock.expectOne(`${baseUrl}/${eventId}`);
    expect(req.request.method).toBe('DELETE');
    req.flush({}, { status: 200, statusText: 'OK' });
  });

  it('should update an event by ID', () => {
    const eventId = 1;
    const updatedEvent = { name: 'Updated Event' };

    service.updateEvent(updatedEvent, eventId).subscribe(response => {
      expect(response.status).toBe(200);
    });

    const req = httpMock.expectOne(`${baseUrl}/${eventId}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updatedEvent);
    req.flush({}, { status: 200, statusText: 'OK' });
  });

  it('should get an event by ID', () => {
    const eventId = '1';
    const mockEvent = { id: 1, name: 'Event 1' };

    service.getEventById(eventId).subscribe(event => {
      expect(event).toEqual(mockEvent);
    });

    const req = httpMock.expectOne(`${baseUrl}/${eventId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockEvent);
  });

  it('should create a new event', () => {
    const newEvent = { name: 'New Event' };
    const mockResponse = { id: 1, name: 'New Event' };

    service.createEvent(newEvent).subscribe(event => {
      expect(event).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newEvent);
    req.flush(mockResponse);
  });
});