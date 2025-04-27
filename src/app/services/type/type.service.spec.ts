import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TypeService } from './type.service';

describe('TypeService', () => {
  let service: TypeService;
  let httpMock: HttpTestingController;

  const baseUrl = 'http://localhost:8089/events/api/eventTypes';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TypeService]
    });

    service = TestBed.inject(TypeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all types', () => {
    const mockTypes = [{ id: 1, name: 'Type 1' }, { id: 2, name: 'Type 2' }];

    service.getAllTypes().subscribe(types => {
      expect(types.length).toBe(2);
      expect(types).toEqual(mockTypes);
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockTypes);
  });

  it('should delete a type by ID', () => {
    const typeId = 1;

    service.deleteType(typeId).subscribe(response => {
      expect(response.status).toBe(200);
    });

    const req = httpMock.expectOne(`${baseUrl}/${typeId}`);
    expect(req.request.method).toBe('DELETE');
    req.flush({}, { status: 200, statusText: 'OK' });
  });

  it('should update a type by ID', () => {
    const typeId = 1;
    const updatedType = { name: 'Updated Type' };

    service.updateType(updatedType, typeId).subscribe(response => {
      expect(response.status).toBe(200);
    });

    const req = httpMock.expectOne(`${baseUrl}/${typeId}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updatedType);
    req.flush({}, { status: 200, statusText: 'OK' });
  });

  it('should get a type by ID', () => {
    const typeId = '1';
    const mockType = { id: 1, name: 'Type 1' };

    service.getTypeById(typeId).subscribe(type => {
      expect(type).toEqual(mockType);
    });

    const req = httpMock.expectOne(`${baseUrl}/${typeId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockType);
  });

  it('should create a new type', () => {
    const newType = { name: 'New Type' };
    const mockResponse = { id: 1, name: 'New Type' };

    service.createType(newType).subscribe(type => {
      expect(type).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newType);
    req.flush(mockResponse);
  });

  it('should get a type by name', () => {
    const name = 'Type 1';
    const mockType = { id: 1, name: 'Type 1' };

    service.getTypeByName(name).subscribe(type => {
      expect(type).toEqual(mockType);
    });

    const req = httpMock.expectOne(`${baseUrl}/name/${name}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockType);
  });

  it('should get ID by name', () => {
    const name = 'Type 1';
    const mockId = 1;

    service.getIdByName(name).subscribe(id => {
      expect(id).toBe(mockId);
    });

    const req = httpMock.expectOne(`${baseUrl}/name/${name}/id`);
    expect(req.request.method).toBe('GET');
    req.flush(mockId);
  });
});