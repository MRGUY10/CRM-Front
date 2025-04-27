import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ContactService } from './contact.service';

describe('ContactService', () => {
  let service: ContactService;
  let httpMock: HttpTestingController;

  const baseUrl = 'http://localhost:8089/events/api/contacts';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ContactService]
    });

    service = TestBed.inject(ContactService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all contacts', () => {
    const mockContacts = [{ id: 1, name: 'Contact 1' }, { id: 2, name: 'Contact 2' }];

    service.getAllContacts().subscribe(contacts => {
      expect(contacts.length).toBe(2);
      expect(contacts).toEqual(mockContacts);
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockContacts);
  });

  it('should delete a contact by ID', () => {
    const contactId = 1;

    service.deleteContact(contactId).subscribe(response => {
      expect(response.status).toBe(200);
    });

    const req = httpMock.expectOne(`${baseUrl}/${contactId}`);
    expect(req.request.method).toBe('DELETE');
    req.flush({}, { status: 200, statusText: 'OK' });
  });

  it('should update a contact by ID', () => {
    const contactId = 1;
    const updatedContact = { name: 'Updated Contact' };

    service.updateContact(updatedContact, contactId).subscribe(response => {
      expect(response.status).toBe(200);
    });

    const req = httpMock.expectOne(`${baseUrl}/${contactId}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updatedContact);
    req.flush({}, { status: 200, statusText: 'OK' });
  });

  it('should get a contact by ID', () => {
    const contactId = '1';
    const mockContact = { id: 1, name: 'Contact 1' };

    service.getContactById(contactId).subscribe(contact => {
      expect(contact).toEqual(mockContact);
    });

    const req = httpMock.expectOne(`${baseUrl}/${contactId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockContact);
  });

  it('should create a new contact', () => {
    const newContact = { name: 'New Contact' };
    const mockResponse = { id: 1, name: 'New Contact' };

    service.createContact(newContact).subscribe(contact => {
      expect(contact).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newContact);
    req.flush(mockResponse);
  });

  it('should get a contact by email', () => {
    const email = 'test@example.com';
    const mockContact = { id: 1, name: 'Contact 1', email: 'test@example.com' };

    service.getContactByEmail(email).subscribe(contact => {
      expect(contact).toEqual(mockContact);
    });

    const req = httpMock.expectOne(`${baseUrl}/email/${email}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockContact);
  });
});