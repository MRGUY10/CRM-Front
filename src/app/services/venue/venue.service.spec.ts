import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { VenueService } from './venue.service';

describe('VenueService', () => {
  let service: VenueService;
  let httpMock: HttpTestingController;

  const baseUrl = 'http://localhost:8089/events/api/venues';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [VenueService]
    });

    service = TestBed.inject(VenueService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all venues', () => {
    const mockVenues = [{ id: 1, name: 'Venue 1' }, { id: 2, name: 'Venue 2' }];

    service.getAllVenues().subscribe(venues => {
      expect(venues.length).toBe(2);
      expect(venues).toEqual(mockVenues);
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockVenues);
  });

  it('should delete a venue by ID', () => {
    const venueId = 1;

    service.deleteVenue(venueId).subscribe(response => {
      expect(response.status).toBe(200);
    });

    const req = httpMock.expectOne(`${baseUrl}/${venueId}`);
    expect(req.request.method).toBe('DELETE');
    req.flush({}, { status: 200, statusText: 'OK' });
  });

  it('should update a venue by ID', () => {
    const venueId = 1;
    const updatedVenue = { name: 'Updated Venue' };

    service.updateVenue(updatedVenue, venueId).subscribe(response => {
      expect(response.status).toBe(200);
    });

    const req = httpMock.expectOne(`${baseUrl}/${venueId}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updatedVenue);
    req.flush({}, { status: 200, statusText: 'OK' });
  });

  it('should get a venue by ID', () => {
    const venueId = '1';
    const mockVenue = { id: 1, name: 'Venue 1' };

    service.getVenueById(venueId).subscribe(venue => {
      expect(venue).toEqual(mockVenue);
    });

    const req = httpMock.expectOne(`${baseUrl}/${venueId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockVenue);
  });

  it('should create a new venue', () => {
    const newVenue = { name: 'New Venue' };
    const mockResponse = { id: 1, name: 'New Venue' };

    service.createVenue(newVenue).subscribe(venue => {
      expect(venue).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newVenue);
    req.flush(mockResponse);
  });

  it('should get ID by name', () => {
    const name = 'Venue 1';
    const mockId = 1;

    service.getIdByName(name).subscribe(id => {
      expect(id).toBe(mockId);
    });

    const req = httpMock.expectOne(`${baseUrl}/name/${name}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockId);
  });
});